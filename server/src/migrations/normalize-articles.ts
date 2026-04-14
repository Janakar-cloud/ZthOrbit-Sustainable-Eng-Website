/**
 * normalize-articles migration
 *
 * Ensures every Article document in the DB conforms to the agreed format:
 *   coverImage  → https:// S3 URL  (or absent)
 *   bodyHtml    → https:// S3 URL pointing to a .html file (or absent)
 *   bodyMd      → plain text only, no embedded URLs
 *
 * What this script does automatically:
 *   1. Uploads inline bodyHtml strings (not starting with https://) to
 *      S3 under articles/content/<uuid>.html and replaces the field with
 *      the resulting S3 URL.
 *   2. Strips embedded https?:// URLs from bodyMd so it remains plain text.
 *
 * What this script flags but cannot auto-fix:
 *   - coverImage values that are not https:// URLs (e.g. relative paths).
 *     These require a manual re-upload through the dashboard.
 *
 * Run:
 *   npx tsx src/migrations/normalize-articles.ts
 */

import { connectDb } from "../config/db.js";
import { Article } from "../models/Article.js";
import { s3 } from "../utils/s3.js";
import { env } from "../config/env.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const S3_BUCKET = env.s3.bucket;
const S3_REGION = env.s3.region;

function isHttpsUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

async function uploadHtmlToS3(html: string, articleId: string): Promise<string> {
  const key = `articles/content/${randomUUID()}.html`;
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: Buffer.from(html, "utf-8"),
      ContentType: "text/html; charset=utf-8",
    })
  );
  const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
  console.log(`  ✅ Uploaded bodyHtml → ${url}  [article ${articleId}]`);
  return url;
}

/** Strip all http(s):// URLs from a plain-text string. */
function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/gi, "").replace(/\s{2,}/g, " ").trim();
}

async function main() {
  await connectDb();

  const articles = await Article.find({});
  console.log(`\nFound ${articles.length} article(s) to audit.\n`);

  const flaggedCover: string[] = [];
  let fixedBodyHtml = 0;
  let fixedBodyMd = 0;

  for (const article of articles) {
    const id = article._id.toString();
    let dirty = false;

    // ── 1. coverImage ────────────────────────────────────────────────────────
    if (article.coverImage) {
      if (!isHttpsUrl(article.coverImage)) {
        flaggedCover.push(`  ❌  [${id}] "${article.title}"  coverImage="${article.coverImage}"`);
        // Cannot auto-fix — the actual image file must be re-uploaded via dashboard
      }
    }

    // ── 2. bodyHtml — upload to S3 if currently an inline HTML string ────────
    if (article.bodyHtml && !isHttpsUrl(article.bodyHtml)) {
      console.log(`  ⬆️   [${id}] Uploading inline bodyHtml to S3…`);
      try {
        article.bodyHtml = await uploadHtmlToS3(article.bodyHtml, id);
        dirty = true;
        fixedBodyHtml++;
      } catch (err) {
        console.error(`  ❌  [${id}] Failed to upload bodyHtml:`, err);
      }
    }

    // ── 3. bodyMd — strip embedded URLs so it is plain text only ─────────────
    if (article.bodyMd && isHttpsUrl(article.bodyMd)) {
      const stripped = stripUrls(article.bodyMd);
      if (stripped !== article.bodyMd) {
        console.log(`  ✂️   [${id}] Stripping URL(s) from bodyMd`);
        article.bodyMd = stripped;
        dirty = true;
        fixedBodyMd++;
      }
    }

    if (dirty) {
      await article.save();
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n── Migration complete ──────────────────────────────────────");
  console.log(`  bodyHtml uploaded to S3 : ${fixedBodyHtml}`);
  console.log(`  bodyMd URLs stripped    : ${fixedBodyMd}`);

  if (flaggedCover.length) {
    console.log(`\n  ⚠️  ${flaggedCover.length} article(s) have a non-S3 coverImage.`);
    console.log("  These must be fixed manually — upload the image via the dashboard editor:\n");
    flaggedCover.forEach((line) => console.log(line));
  } else {
    console.log("  coverImage              : all OK");
  }
  console.log("");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
