import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";
import { PodcastComment } from "../models/PodcastComment.js";
import { logger } from "../utils/logger.js";

const router = Router();

// ─── model map ───────────────────────────────────────────────────────────────

type ContentType = "video" | "podcast" | "article";

function getModel(type: ContentType) {
  if (type === "video") return Video;
  if (type === "podcast") return Podcast;
  return Article;
}

const typeSchema = z.enum(["video", "podcast", "article"]);

// ─── POST /:type/:id/view ─────────────────────────────────────────────────────
// Records a single view. Call once per real play/open event from the client.
router.post("/:type/:id/view", async (req, res) => {
  const parsed = typeSchema.safeParse(req.params.type);
  if (!parsed.success) return res.status(400).json({ error: "type must be video | podcast | article" });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const Model = getModel(parsed.data);
    const doc = await (Model as any).findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, select: "views likes commentsCount title" }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });

    logger.info(`view recorded`, {
      source: "engage",
      meta: { type: parsed.data, id: req.params.id },
      req,
    });

    res.json({ views: doc.views });
  } catch (err) {
    logger.error("engage view error", { source: "engage", meta: { err }, req });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /:type/:id/like  (toggle: like → unlike on second call) ─────────────
router.post("/:type/:id/like", async (req, res) => {
  const parsed = typeSchema.safeParse(req.params.type);
  if (!parsed.success) return res.status(400).json({ error: "type must be video | podcast | article" });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const { action } = z.object({ action: z.enum(["like", "unlike"]).default("like") }).parse(req.body ?? {});

    const Model = getModel(parsed.data);
    const doc = await (Model as any).findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: action === "like" ? 1 : -1 } },
      { new: true, select: "views likes commentsCount title" }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json({ likes: Math.max(0, doc.likes) });
  } catch (err) {
    logger.error("engage like error", { source: "engage", meta: { err }, req });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /stats/:type/:id ─────────────────────────────────────────────────────
// Returns views, likes, commentsCount for a single item.
router.get("/stats/:type/:id", async (req, res) => {
  const parsed = typeSchema.safeParse(req.params.type);
  if (!parsed.success) return res.status(400).json({ error: "type must be video | podcast | article" });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const Model = getModel(parsed.data);
    const doc = await (Model as any)
      .findById(req.params.id)
      .select("views likes commentsCount title");

    if (!doc) return res.status(404).json({ error: "Not found" });

    // Live comment count from PodcastComment collection for podcasts
    let commentsCount = doc.commentsCount ?? 0;
    if (parsed.data === "podcast") {
      commentsCount = await PodcastComment.countDocuments({ podcastId: req.params.id });
    }

    res.json({ views: doc.views ?? 0, likes: doc.likes ?? 0, commentsCount });
  } catch (err) {
    logger.error("engage stats error", { source: "engage", meta: { err }, req });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /trending ──────────────────────────────────────────────────────────
// Returns top content by views across all types.
// Query params: limit (default 10), type (video|podcast|article|all), days (default 30)
router.get("/trending", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const type = (req.query.type as string) || "all";
    const days = Number(req.query.days || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const baseFilter = { status: "published", createdAt: { $gte: since } };
    const fields = "title views likes commentsCount thumbnailUrl imageUrl coverImage publishDate createdAt";

    const [videos, podcasts, articles] = await Promise.all([
      type === "all" || type === "video"
        ? Video.find(baseFilter).select(fields).sort({ views: -1 }).limit(limit).lean()
        : Promise.resolve([]),
      type === "all" || type === "podcast"
        ? Podcast.find(baseFilter).select(fields).sort({ views: -1 }).limit(limit).lean()
        : Promise.resolve([]),
      type === "all" || type === "article"
        ? Article.find(baseFilter).select(fields).sort({ views: -1 }).limit(limit).lean()
        : Promise.resolve([]),
    ]);

    if (type !== "all") {
      const result = [...videos, ...podcasts, ...articles]
        .sort((a: any, b: any) => (b.views ?? 0) - (a.views ?? 0))
        .slice(0, limit);
      return res.json({ items: result, total: result.length });
    }

    // Mixed trending: tag each item with its type
    const tagged = [
      ...videos.map((v: any) => ({ ...v, _type: "video" })),
      ...podcasts.map((p: any) => ({ ...p, _type: "podcast" })),
      ...articles.map((a: any) => ({ ...a, _type: "article" })),
    ]
      .sort((a: any, b: any) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, limit);

    res.json({ items: tagged, total: tagged.length });
  } catch (err) { next(err); }
});

// ─── GET /latest ─────────────────────────────────────────────────────────────
// Returns the most recently published content across all types.
// Query params: limit (default 10), type (video|podcast|article|all)
router.get("/latest", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const type = (req.query.type as string) || "all";
    const fields = "title views likes commentsCount thumbnailUrl imageUrl coverImage publishDate createdAt";

    const filter = { status: "published" };

    const [videos, podcasts, articles] = await Promise.all([
      type === "all" || type === "video"
        ? Video.find(filter).select(fields).sort({ publishDate: -1, createdAt: -1 }).limit(limit).lean()
        : Promise.resolve([]),
      type === "all" || type === "podcast"
        ? Podcast.find(filter).select(fields).sort({ publishDate: -1, createdAt: -1 }).limit(limit).lean()
        : Promise.resolve([]),
      type === "all" || type === "article"
        ? Article.find(filter).select(fields).sort({ publishDate: -1, createdAt: -1 }).limit(limit).lean()
        : Promise.resolve([]),
    ]);

    const tagged = [
      ...videos.map((v: any) => ({ ...v, _type: "video" })),
      ...podcasts.map((p: any) => ({ ...p, _type: "podcast" })),
      ...articles.map((a: any) => ({ ...a, _type: "article" })),
    ]
      .sort((a: any, b: any) => {
        const da = new Date(a.publishDate ?? a.createdAt ?? 0).getTime();
        const db = new Date(b.publishDate ?? b.createdAt ?? 0).getTime();
        return db - da;
      })
      .slice(0, limit);

    res.json({ items: tagged, total: tagged.length });
  } catch (err) { next(err); }
});

export default router;
