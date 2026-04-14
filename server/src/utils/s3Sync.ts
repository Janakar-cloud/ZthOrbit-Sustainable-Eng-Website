import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";
import { env } from "../config/env.js";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";
import { isCopyVariantTitle, normalizeMediaTitle, stripCopySuffix } from "./mediaTitle.js";

type MongoIdLike = { toString(): string } | string;

type CleanupModelLike = {
  find: (...args: any[]) => { lean: () => Promise<any[]> };
  deleteMany: (filter: object) => Promise<unknown>;
};

type BackfillModelLike = {
  find: (...args: any[]) => { lean: () => Promise<any[]> };
  bulkWrite: (...args: any[]) => Promise<unknown>;
};

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
  return stripCopySuffix(baseName(fileName));
}

/** Escape special regex characters so a title can be used inside RegExp */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractS3KeyFromPublicUrl(storedUrl: string, prefix: string): string | null {
  const bucketHost = `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/`;
  if (!storedUrl.startsWith(bucketHost)) return null;
  const key = decodeURIComponent(storedUrl.slice(bucketHost.length));
  return key.startsWith(prefix) ? key : null;
}

function extractArticleFileKey(bodyMd: string): string | null {
  const bucketHost = `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/`;
  const urlMatch = bodyMd.match(/https?:\/\/[^\s)]+/);
  if (!urlMatch) return null;
  return extractS3KeyFromPublicUrl(urlMatch[0], "articels/");
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

type CleanupDoc = {
  _id: string;
  title: string;
  status?: string;
  publishDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

function scoreDoc(doc: CleanupDoc): number {
  return [
    isCopyVariantTitle(doc.title) ? 0 : 1,
    doc.status === "published" ? 1 : 0,
    doc.publishDate ? new Date(doc.publishDate).getTime() : 0,
    doc.createdAt ? new Date(doc.createdAt).getTime() : 0,
    doc.updatedAt ? new Date(doc.updatedAt).getTime() : 0,
  ].reduce((sum, part, index) => sum + part * Math.pow(10, 12 - index * 3), 0);
}

async function cleanupDuplicateTitles(): Promise<void> {
  const cleanupModel = async (
    model: CleanupModelLike
  ) => {
    const docs = (await model.find({}, "title status publishDate createdAt updatedAt").lean()) as CleanupDoc[];
    const groups = new Map<string, CleanupDoc[]>();

    for (const doc of docs) {
      const title = doc.title?.trim();
      if (!title) continue;
      const normalized = normalizeMediaTitle(title);
      if (!normalized) continue;
      const bucket = groups.get(normalized) ?? [];
      bucket.push(doc);
      groups.set(normalized, bucket);
    }

    const idsToDelete: string[] = [];

    for (const group of groups.values()) {
      if (group.length === 1) {
        if (isCopyVariantTitle(group[0].title)) idsToDelete.push(group[0]._id);
        continue;
      }

      const sorted = [...group].sort((left, right) => scoreDoc(right) - scoreDoc(left));
      idsToDelete.push(...sorted.slice(1).map((doc) => doc._id));
    }

    if (idsToDelete.length > 0) {
      await model.deleteMany({ _id: { $in: idsToDelete } });
    }
  };

  await Promise.all([
    cleanupModel(Video),
    cleanupModel(Podcast),
    cleanupModel(Article),
  ]);
}

async function backfillNormalizedTitles(): Promise<void> {
  const backfillModel = async (
    model: BackfillModelLike
  ) => {
    const docs = (await model.find({}, "title").lean()) as Array<{ _id: MongoIdLike; title: string }>;
    const ops = docs
      .map((doc) => {
        const normalizedTitle = normalizeMediaTitle(doc.title ?? "");
        if (!normalizedTitle) return null;
        return {
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { normalizedTitle } },
          },
        };
      })
      .filter(Boolean) as object[];

    if (ops.length > 0) {
      await model.bulkWrite(ops);
    }
  };

  await Promise.all([
    backfillModel(Video),
    backfillModel(Podcast),
    backfillModel(Article),
  ]);
}

export async function ensureMediaUniqueIndexes(): Promise<void> {
  await cleanupDuplicateTitles();
  await backfillNormalizedTitles();
  await Promise.all([
    Video.createIndexes(),
    Podcast.createIndexes(),
    Article.createIndexes(),
  ]);
}

async function deleteMissingS3BackedRecords(
  videoFiles: { key: string }[],
  podcastFiles: { key: string }[]
): Promise<{ videos: number; podcasts: number; articles: number }> {
  const videoKeys = new Set(videoFiles.map(({ key }) => key));
  const podcastKeys = new Set(podcastFiles.map(({ key }) => key));

  const [videos, podcasts] = await Promise.all([
    Video.find({}, "streamUrl").lean(),
    Podcast.find({}, "audioUrl").lean(),
  ]);

  const videoIdsToDelete = (videos as Array<{ _id: MongoIdLike; streamUrl?: string }>)
    .filter((doc) => {
      const key = doc.streamUrl ? extractS3KeyFromPublicUrl(doc.streamUrl, "LiveTV/") : null;
      return key ? !videoKeys.has(key) : false;
    })
    .map((doc) => doc._id);

  const podcastIdsToDelete = (podcasts as Array<{ _id: MongoIdLike; audioUrl?: string }>)
    .filter((doc) => {
      const key = doc.audioUrl ? extractS3KeyFromPublicUrl(doc.audioUrl, "podcast/") : null;
      return key ? !podcastKeys.has(key) : false;
    })
    .map((doc) => doc._id);

  await Promise.all([
    videoIdsToDelete.length ? Video.deleteMany({ _id: { $in: videoIdsToDelete } }) : Promise.resolve(),
    podcastIdsToDelete.length ? Podcast.deleteMany({ _id: { $in: podcastIdsToDelete } }) : Promise.resolve(),
  ]);

  return {
    videos: videoIdsToDelete.length,
    podcasts: podcastIdsToDelete.length,
    // Articles are managed exclusively via the dashboard API — never auto-deleted by S3 sync
    articles: 0,
  };
}

// ─── per-type sync functions ─────────────────────────────────────────────────

async function syncVideos(files: { key: string; lastModified: Date }[], thumbMap: Map<string, string>): Promise<{ added: number; updated: number }> {
  let added = 0, updated = 0;
  for (const { key, lastModified } of files) {
    const streamUrl = s3Url(key);
    const fileName  = key.split("/").pop() ?? key;
    if (isCopyVariantTitle(baseName(fileName))) continue;
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
      const normalizedTitle = normalizeMediaTitle(title);
      const upserted = await Video.findOneAndUpdate(
        { normalizedTitle },
        { $setOnInsert: { title, description: "", streamUrl, thumbnailUrl: thumbnail, publishDate: lastModified, status: "published", isLive: false, tags: [] } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (upserted) added++;
    }
  }
  return { added, updated };
}

async function syncPodcasts(files: { key: string; lastModified: Date }[], thumbMap: Map<string, string>): Promise<{ added: number; updated: number }> {
  let added = 0, updated = 0;
  for (const { key, lastModified } of files) {
    const audioUrl  = s3Url(key);
    const fileName  = key.split("/").pop() ?? key;
    if (isCopyVariantTitle(baseName(fileName))) continue;
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
      const normalizedTitle = normalizeMediaTitle(title);
      await Podcast.findOneAndUpdate(
        { normalizedTitle },
        { $setOnInsert: { title, description: "", audioUrl, imageUrl, publishDate: lastModified, status: "published", tags: [] } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      added++;
    }
  }
  return { added, updated };
}

async function syncArticles(files: { key: string; lastModified: Date }[], thumbMap: Map<string, string>): Promise<{ added: number; updated: number }> {
  let added = 0, updated = 0;
  for (const { key, lastModified } of files) {
    const fileUrl   = s3Url(key);
    const bodyMd    = `Full article hosted in S3: ${fileUrl}`;
    const fileName  = key.split("/").pop() ?? key;
    if (isCopyVariantTitle(baseName(fileName))) continue;
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
      const normalizedTitle = normalizeMediaTitle(title);
      await Article.findOneAndUpdate(
        { normalizedTitle },
        { $setOnInsert: { title, subtitle: "", bodyMd, coverImage, publishDate: lastModified, status: "published", featured: false, tags: [] } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
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
  removed: { videos: number; podcasts: number; articles: number };
  durationMs: number;
}

export async function syncS3ToDb(): Promise<SyncResult> {
  const start = Date.now();

  const VIDEO_EXTS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v", ".ts"];
  const AUDIO_EXTS = [".m4a", ".mp3", ".wav", ".ogg", ".aac", ".flac"];

  const [videoItems, podcastItems, videoThumbs, podcastThumbs] = await Promise.all([
    listAllKeys("LiveTV"),
    listAllKeys("podcast"),
    buildThumbnailMap("Thumbnail/videos"),
    buildThumbnailMap("Thumbnail/podcast"),
  ]);

  const videoFiles = videoItems.filter(({ key }) => VIDEO_EXTS.some((ext) => key.toLowerCase().endsWith(ext)));
  const podcastFiles = podcastItems.filter(({ key }) => AUDIO_EXTS.some((ext) => key.toLowerCase().endsWith(ext)));

  // Articles are managed exclusively via the dashboard API — no S3 folder sync
  const removed = await deleteMissingS3BackedRecords(videoFiles, podcastFiles);
  await cleanupDuplicateTitles();

  const [videos, podcasts] = await Promise.all([
    syncVideos(videoFiles, videoThumbs),
    syncPodcasts(podcastFiles, podcastThumbs),
  ]);

  return { videos, podcasts, articles: { added: 0, updated: 0 }, removed, durationMs: Date.now() - start };
}
