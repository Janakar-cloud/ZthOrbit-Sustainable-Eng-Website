import { Router } from "express";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";

const router = Router();
const LIMIT = 4;
const HAS_IMAGE = { $exists: true, $nin: ["", null] };

function dedupeByTitle<T extends { title: string }>(docs: T[]): T[] {
  const seen = new Set<string>();
  return docs.filter((doc) => {
    const key = (doc.title?.trim() ?? "").replace(/\s+/g, " ").toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
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

    // Deduplicate by exact title (case-insensitive) — keeps the most recently created
    res.json({
      videos: dedupeByTitle(videos),
      podcasts: dedupeByTitle(podcasts),
      articles: dedupeByTitle(articles),
    });
  } catch (err) {
    console.error("[home] GET / failed:", err);
    res.status(500).json({ error: "Failed to fetch home data" });
  }
});

export default router;
