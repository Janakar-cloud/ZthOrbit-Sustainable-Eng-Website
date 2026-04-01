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
        .limit(LIMIT)
        .select("title description thumbnailUrl streamUrl isLive publishDate"),
      Podcast.find({ status: "published" })
        .sort({ publishDate: -1, createdAt: -1 })
        .limit(LIMIT)
        .select("title description imageUrl audioUrl duration publishDate"),
      Article.find({ status: "published" })
        .sort({ publishDate: -1, createdAt: -1 })
        .limit(LIMIT)
        .select("title subtitle coverImage readTime publishDate"),
    ]);
    res.json({ videos, podcasts, articles });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch home data" });
  }
});

export default router;
