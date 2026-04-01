import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";
import { env } from "../config/env.js";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";

// ─── helpers ────────────────────────────────────────────────────────────────

function s3Url(key: string): string {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${encodedKey}`;
}

/** Normalise a raw S3 filename for fuzzy thumbnail matching */
function normalise(name: string): string {
  return decodeURIComponent(name.replace(/\+/g, " "))
    .replace(/\.[^.]+$/, "")   // strip extension
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Derive a human-readable title from the decoded filename (no extension) */
function titleFromKey(key: string): string {
  const fileName = key.split("/").pop() || key;
  const decoded = decodeURIComponent(fileName.replace(/\+/g, " ")).replace(/\.[^.]+$/, "");
  // CamelCase → insert spaces, then title-case
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

/** List every object (handles >1000 via continuation token) */
async function listAllKeys(prefix: string): Promise<{ key: string; lastModified: Date }[]> {
  const results: { key: string; lastModified: Date }[] = [];
  let continuationToken: string | undefined;

  do {
    const cmd = new ListObjectsV2Command({
      Bucket: env.s3.bucket,
      Prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
      ContinuationToken: continuationToken,
    });
    const resp = await s3.send(cmd);
    for (const item of resp.Contents ?? []) {
      if (item.Key && !item.Key.endsWith("/")) {
        results.push({ key: item.Key, lastModified: item.LastModified ?? new Date() });
      }
    }
    continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (continuationToken);

  return results;
}

/** Build a normalised-name → url map from all objects under a thumbnail prefix */
async function buildThumbnailMap(prefix: string): Promise<Map<string, string>> {
  const items = await listAllKeys(prefix);
  const map = new Map<string, string>();
  for (const { key } of items) {
    const fileName = key.split("/").pop() ?? key;
    map.set(normalise(fileName), s3Url(key));
  }
  return map;
}

/** Find the best-matching thumbnail URL by progressive prefix overlap */
function matchThumbnail(mediaFileName: string, thumbMap: Map<string, string>): string {
  const normMedia = normalise(mediaFileName);
  // exact match
  if (thumbMap.has(normMedia)) return thumbMap.get(normMedia)!;
  // longest common prefix among candidates
  let best = "";
  let bestUrl = "";
  for (const [normThumb, url] of thumbMap) {
    const shorter = normMedia.length < normThumb.length ? normMedia : normThumb;
    const longer  = normMedia.length < normThumb.length ? normThumb  : normMedia;
    if (longer.startsWith(shorter) || normMedia.startsWith(normThumb.slice(0, 10))) {
      if (normThumb.length > best.length) { best = normThumb; bestUrl = url; }
    }
  }
  return bestUrl;
}

// ─── per-type sync functions ─────────────────────────────────────────────────

async function syncVideos(thumbMap: Map<string, string>): Promise<{ added: number; updated: number }> {
  const VIDEO_EXTS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v", ".ts"];
  const items = await listAllKeys("LiveTV");
  const files = items.filter(({ key }) => VIDEO_EXTS.some(ext => key.toLowerCase().endsWith(ext)));

  let added = 0, updated = 0;
  for (const { key, lastModified } of files) {
    const streamUrl = s3Url(key);
    const fileName  = key.split("/").pop() ?? key;
    const thumbnail = matchThumbnail(fileName, thumbMap);
    const title     = titleFromKey(key);

    const existing = await Video.findOne({ streamUrl });
    if (existing) {
      // only update thumbnail if we now have one and didn't before
      if (!existing.thumbnailUrl && thumbnail) {
        await Video.updateOne({ _id: existing._id }, { thumbnailUrl: thumbnail });
        updated++;
      }
    } else {
      await Video.create({
        title,
        description: "",
        streamUrl,
        thumbnailUrl: thumbnail,
        publishDate: lastModified,
        status: "published",
        isLive: false,
        tags: [],
      });
      added++;
    }
  }
  return { added, updated };
}

async function syncPodcasts(thumbMap: Map<string, string>): Promise<{ added: number; updated: number }> {
  const AUDIO_EXTS = [".m4a", ".mp3", ".wav", ".ogg", ".aac", ".flac"];
  const items = await listAllKeys("podcast");
  const files = items.filter(({ key }) => AUDIO_EXTS.some(ext => key.toLowerCase().endsWith(ext)));

  let added = 0, updated = 0;
  for (const { key, lastModified } of files) {
    const audioUrl  = s3Url(key);
    const fileName  = key.split("/").pop() ?? key;
    const imageUrl  = matchThumbnail(fileName, thumbMap);
    const title     = titleFromKey(key);

    const existing = await Podcast.findOne({ audioUrl });
    if (existing) {
      if (!existing.imageUrl && imageUrl) {
        await Podcast.updateOne({ _id: existing._id }, { imageUrl });
        updated++;
      }
    } else {
      await Podcast.create({
        title,
        description: "",
        audioUrl,
        imageUrl,
        publishDate: lastModified,
        status: "published",
        tags: [],
      });
      added++;
    }
  }
  return { added, updated };
}

async function syncArticles(thumbMap: Map<string, string>): Promise<{ added: number; updated: number }> {
  const ARTICLE_EXTS = [".docx", ".doc", ".pdf"];
  const items = await listAllKeys("articels");
  const files = items.filter(({ key }) => ARTICLE_EXTS.some(ext => key.toLowerCase().endsWith(ext)));

  let added = 0, updated = 0;
  for (const { key, lastModified } of files) {
    const fileUrl   = s3Url(key);
    const bodyMd    = `Full article hosted in S3: ${fileUrl}`;
    const fileName  = key.split("/").pop() ?? key;
    const coverImage = matchThumbnail(fileName, thumbMap);
    const title     = titleFromKey(key);

    // Use the S3 file URL as unique identifier (stored inside bodyMd)
    const existing = await Article.findOne({ bodyMd });
    if (existing) {
      if (!existing.coverImage && coverImage) {
        await Article.updateOne({ _id: existing._id }, { coverImage });
        updated++;
      }
    } else {
      await Article.create({
        title,
        subtitle: "",
        bodyMd,
        coverImage,
        publishDate: lastModified,
        status: "published",
        featured: false,
        tags: [],
      });
      added++;
    }
  }
  return { added, updated };
}

// ─── public API ─────────────────────────────────────────────────────────────

export interface SyncResult {
  videos:   { added: number; updated: number };
  podcasts: { added: number; updated: number };
  articles: { added: number; updated: number };
  durationMs: number;
}

export async function syncS3ToDb(): Promise<SyncResult> {
  const start = Date.now();

  // Build thumbnail maps in parallel
  const [videoThumbs, podcastThumbs, articleThumbs] = await Promise.all([
    buildThumbnailMap("Thumbnail/videos"),
    buildThumbnailMap("Thumbnail/podcast"),
    buildThumbnailMap("Thumbnail/articels"),
  ]);

  // Sync each collection in parallel
  const [videos, podcasts, articles] = await Promise.all([
    syncVideos(videoThumbs),
    syncPodcasts(podcastThumbs),
    syncArticles(articleThumbs),
  ]);

  return { videos, podcasts, articles, durationMs: Date.now() - start };
}
