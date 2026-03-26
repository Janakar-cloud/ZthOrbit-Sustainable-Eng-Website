import { connectDb } from "../config/db.js";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { uploadToS3, generateS3Key } from "../utils/s3-upload.js";
import https from "https";
import http from "http";
import { Readable } from "stream";
import { parse as parseUrl } from "url";
import path from "path";

interface MigrationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Download file from URL as buffer
 */
async function downloadFile(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = parseUrl(url);
    const protocol = parsedUrl.protocol === "https:" ? https : http;

    protocol
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirects (common with Google Drive)
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            downloadFile(redirectUrl).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const contentType = response.headers["content-type"] || "application/octet-stream";
          resolve({ buffer, contentType });
        });
        response.on("error", reject);
      })
      .on("error", reject);
  });
}

/**
 * Extract filename from URL or generate one
 */
function getFilename(url: string, fallback: string): string {
  try {
    const urlPath = parseUrl(url).pathname || "";
    const filename = path.basename(urlPath);
    if (filename && filename.includes(".")) {
      return filename;
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return fallback;
}

/**
 * Migrate all videos from current URLs to S3
 */
async function migrateVideos(): Promise<MigrationResult> {
  const result: MigrationResult = { success: 0, failed: 0, errors: [] };

  console.log("\n🎬 Starting video migration...");
  const videos = await Video.find({});
  console.log(`Found ${videos.length} videos to migrate`);

  for (const video of videos) {
    try {
      console.log(`\n📹 Processing: ${video.title} (${video._id})`);

      // Skip if already on S3
      if (video.streamUrl.includes(".s3.") || video.streamUrl.includes("s3.amazonaws.com")) {
        console.log("  ⏭️  Already on S3, skipping streamUrl");
      } else {
        console.log(`  ⬇️  Downloading from: ${video.streamUrl}`);
        const { buffer, contentType } = await downloadFile(video.streamUrl);
        console.log(`  ✓ Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

        const filename = getFilename(video.streamUrl, `${video._id}.mp4`);
        const s3Key = generateS3Key("videos", filename);
        console.log(`  ⬆️  Uploading to S3: ${s3Key}`);

        const s3Url = await uploadToS3(s3Key, buffer, contentType);
        console.log(`  ✓ Uploaded to: ${s3Url}`);

        video.streamUrl = s3Url;
      }

      // Migrate thumbnail if exists
      if (video.thumbnailUrl && !video.thumbnailUrl.includes(".s3.") && !video.thumbnailUrl.includes("s3.amazonaws.com")) {
        console.log(`  ⬇️  Downloading thumbnail from: ${video.thumbnailUrl}`);
        const { buffer, contentType } = await downloadFile(video.thumbnailUrl);
        console.log(`  ✓ Downloaded thumbnail ${(buffer.length / 1024).toFixed(2)} KB`);

        const filename = getFilename(video.thumbnailUrl, `${video._id}-thumb.jpg`);
        const s3Key = generateS3Key("thumbnails", filename);
        console.log(`  ⬆️  Uploading thumbnail to S3: ${s3Key}`);

        const s3Url = await uploadToS3(s3Key, buffer, contentType);
        console.log(`  ✓ Uploaded thumbnail to: ${s3Url}`);

        video.thumbnailUrl = s3Url;
      }

      await video.save();
      console.log("  ✅ Video updated in database");
      result.success++;
    } catch (error) {
      console.error(`  ❌ Failed to migrate video ${video._id}:`, error);
      result.failed++;
      result.errors.push({
        id: video._id.toString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}

/**
 * Migrate all podcasts from current URLs to S3
 */
async function migratePodcasts(): Promise<MigrationResult> {
  const result: MigrationResult = { success: 0, failed: 0, errors: [] };

  console.log("\n🎙️  Starting podcast migration...");
  const podcasts = await Podcast.find({});
  console.log(`Found ${podcasts.length} podcasts to migrate`);

  for (const podcast of podcasts) {
    try {
      console.log(`\n🎧 Processing: ${podcast.title} (${podcast._id})`);

      // Skip if already on S3
      if (podcast.audioUrl.includes(".s3.") || podcast.audioUrl.includes("s3.amazonaws.com")) {
        console.log("  ⏭️  Already on S3, skipping audioUrl");
      } else {
        console.log(`  ⬇️  Downloading from: ${podcast.audioUrl}`);
        const { buffer, contentType } = await downloadFile(podcast.audioUrl);
        console.log(`  ✓ Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

        const filename = getFilename(podcast.audioUrl, `${podcast._id}.mp3`);
        const s3Key = generateS3Key("podcasts", filename);
        console.log(`  ⬆️  Uploading to S3: ${s3Key}`);

        const s3Url = await uploadToS3(s3Key, buffer, contentType);
        console.log(`  ✓ Uploaded to: ${s3Url}`);

        podcast.audioUrl = s3Url;
      }

      // Migrate image if exists
      if (podcast.imageUrl && !podcast.imageUrl.includes(".s3.") && !podcast.imageUrl.includes("s3.amazonaws.com")) {
        console.log(`  ⬇️  Downloading image from: ${podcast.imageUrl}`);
        const { buffer, contentType } = await downloadFile(podcast.imageUrl);
        console.log(`  ✓ Downloaded image ${(buffer.length / 1024).toFixed(2)} KB`);

        const filename = getFilename(podcast.imageUrl, `${podcast._id}-cover.jpg`);
        const s3Key = generateS3Key("podcast-images", filename);
        console.log(`  ⬆️  Uploading image to S3: ${s3Key}`);

        const s3Url = await uploadToS3(s3Key, buffer, contentType);
        console.log(`  ✓ Uploaded image to: ${s3Url}`);

        podcast.imageUrl = s3Url;
      }

      await podcast.save();
      console.log("  ✅ Podcast updated in database");
      result.success++;
    } catch (error) {
      console.error(`  ❌ Failed to migrate podcast ${podcast._id}:`, error);
      result.failed++;
      result.errors.push({
        id: podcast._id.toString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}

/**
 * Main migration function
 */
async function main() {
  console.log("🚀 Starting migration to S3...\n");
  console.log("⚠️  Make sure your S3 credentials are configured in .env");
  console.log("⚠️  This will download files and upload to S3\n");

  try {
    await connectDb();
    console.log("✓ Connected to MongoDB\n");

    const videoResult = await migrateVideos();
    const podcastResult = await migratePodcasts();

    console.log("\n\n📊 Migration Summary:");
    console.log("=".repeat(50));
    console.log(`\n📹 Videos:`);
    console.log(`  ✅ Success: ${videoResult.success}`);
    console.log(`  ❌ Failed: ${videoResult.failed}`);
    if (videoResult.errors.length > 0) {
      console.log(`  Errors:`);
      videoResult.errors.forEach((e) => console.log(`    - ${e.id}: ${e.error}`));
    }

    console.log(`\n🎙️  Podcasts:`);
    console.log(`  ✅ Success: ${podcastResult.success}`);
    console.log(`  ❌ Failed: ${podcastResult.failed}`);
    if (podcastResult.errors.length > 0) {
      console.log(`  Errors:`);
      podcastResult.errors.forEach((e) => console.log(`    - ${e.id}: ${e.error}`));
    }

    console.log("\n✅ Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
