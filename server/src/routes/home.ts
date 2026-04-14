import { Router } from "express";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";

const router = Router();
const LIMIT = 4;
const COPY_SUFFIX_RE = /\s*\(\d+\)\s*$/;
const HAS_IMAGE = { $exists: true, $nin: ["", null] };

function dedupeCanonical<T extends { title: string }>(docs: T[]): T[] {
  const seen = new Set<string>();

  return docs.filter((doc) => {
    const title = doc.title?.trim() ?? "";
    if (!title || COPY_SUFFIX_RE.test(title)) return false;

    const normalized = title.replace(COPY_SUFFIX_RE, "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;

    seen.add(normalized);
    return true;
  }).slice(0, LIMIT);
}

router.get("/", async (_req, res) => {
  try {
    const [videos, podcasts, articles] = await Promise.all([
      Video.find({ status: "published" })
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(LIMIT * 3)
        .select("title description thumbnailUrl streamUrl isLive publishDate updatedAt"),
      Podcast.find({ status: "published", imageUrl: HAS_IMAGE })
        .sort({ publishDate: -1, createdAt: -1 })
        .limit(LIMIT * 3)
        .select("title description imageUrl audioUrl duration publishDate"),
      Article.find({ status: "published", coverImage: HAS_IMAGE })
        .sort({ publishDate: -1, createdAt: -1 })
        .limit(LIMIT * 3)
        .select("title subtitle coverImage readTime publishDate"),
    ]);

    // Deduplicate by normalised title (case-insensitive) — keeps the first (most recent)
    res.json({
      videos: dedupeCanonical(videos),
      podcasts: dedupeCanonical(podcasts),
      articles: dedupeCanonical(articles),
    });
  } catch (err) {
    console.error("[home] GET / failed:", err);
    res.status(500).json({ error: "Failed to fetch home data" });
  }
});

export default router;
