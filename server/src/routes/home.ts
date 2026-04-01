import { Router } from "express";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";

const router = Router();
const LIMIT = 6;

router.get("/", async (_req, res) => {
  try {
    const [videos, podcasts, articles] = await Promise.all([
      Video.find({ status: "published" })
        .sort({ publishDate: -1, createdAt: -1 })
        .limit(LIMIT * 3)
        .select("title description thumbnailUrl streamUrl isLive publishDate"),
      Podcast.find({ status: "published" })
        .sort({ publishDate: -1, createdAt: -1 })
        .limit(LIMIT * 3)
        .select("title description imageUrl audioUrl duration publishDate"),
      Article.find({ status: "published" })
        .sort({ publishDate: -1, createdAt: -1 })
        .limit(LIMIT * 3)
        .select("title subtitle coverImage readTime publishDate"),
    ]);

    // Deduplicate by normalised title (case-insensitive) — keeps the first (most recent)
    const dedupe = <T extends { title: string }>(docs: T[]): T[] => {
      const seen = new Set<string>();
      return docs.filter(d => {
        const key = d.title.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, LIMIT);
    };

    res.json({
      videos:   dedupe(videos),
      podcasts: dedupe(podcasts),
      articles: dedupe(articles),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch home data" });
  }
});

export default router;
