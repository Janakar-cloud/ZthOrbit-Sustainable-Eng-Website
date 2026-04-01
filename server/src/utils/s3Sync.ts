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

/** Decode an S3 key component (handles both %xx and + encoding) */
function decodeKey(raw: string): string {
  return decodeURIComponent(raw.replace(/\+/g, " "));
}

/** Strip the file extension and return the bare base name */
function baseName(name: string): string {
  return decodeKey(name).replace(/\.[^.]+$/, "").trim();
}

/** Derive a human-readable title from the decoded filename (no extension, no path) */
function titleFromKey(key: string): string {
  const fileName = key.split("/").pop() ?? key;
  return baseName(fileName);
}

/** Escape special regex characters so a title can be used inside RegExp */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

/**
 * Build a base-name → url map from all objects under a thumbnail prefix.
 * Key is the decoded filename WITHOUT extension, lowercased for case-insensitive lookup.
 * e.g. "Thumbnail/videos/My Session.jpg" → map key "my session"
 */
async function buildThumbnailMap(prefix: string): Promise<Map<string, string>> {
  const items = await listAllKeys(prefix);
  const map = new Map<string, string>();
  for (const { key } of items) {
    const fileName = key.split("/").pop() ?? key;
    map.set(baseName(fileName).toLowerCase(), s3Url(key));
  }
  return map;
}

/**
 * Exact same-name match: the thumbnail file must have the SAME base name
 * as the media file (different extension is fine).
 * e.g. media "My Session.mp4" matches thumbnail "My Session.jpg"
 */
function matchThumbnail(mediaFileName: string, thumbMap: Map<string, string>): string {
  const key = baseName(mediaFileName).toLowerCase();
  return thumbMap.get(key) ?? "";
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

    const titleRegex = new RegExp(`^${escapeRegex(title)}$`, "i");
    const existing = await Video.findOne({
      $or: [{ streamUrl }, { title: titleRegex }],
    });
    if (existing) {
      // Always re-sync title and thumbnail so renames/new thumbnails in S3 reflect immediately
      const needsUpdate =
        existing.title !== title ||
        (thumbnail && existing.thumbnailUrl !== thumbnail);
      if (needsUpdate) {
        await Video.updateOne(
          { _id: existing._id },
          { title, ...(thumbnail && { thumbnailUrl: thumbnail }) }
        );
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

    const titleRegex = new RegExp(`^${escapeRegex(title)}$`, "i");
    const existing = await Podcast.findOne({
      $or: [{ audioUrl }, { title: titleRegex }],
    });
    if (existing) {
      const needsUpdate =
        existing.title !== title ||
        (imageUrl && existing.imageUrl !== imageUrl);
      if (needsUpdate) {
        await Podcast.updateOne(
          { _id: existing._id },
          { title, ...(imageUrl && { imageUrl }) }
        );
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

    const titleRegex = new RegExp(`^${escapeRegex(title)}$`, "i");
    const existing = await Article.findOne({
      $or: [{ bodyMd }, { title: titleRegex }],
    });
    if (existing) {
      const needsUpdate =
        existing.title !== title ||
        (coverImage && existing.coverImage !== coverImage);
      if (needsUpdate) {
        await Article.updateOne(
          { _id: existing._id },
          { title, ...(coverImage && { coverImage }) }
        );
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
