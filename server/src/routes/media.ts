import { Router } from "express";
import { z } from "zod";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Tag, normalizeTagKey, normalizeTagName } from "../models/Tag.js";
import { requireAuth } from "../middleware/auth.js";
import { escapeRegex } from "../utils/regex.js";
import { filterCanonicalMedia } from "../utils/mediaTitle.js";

const router = Router();
const HAS_IMAGE = { $exists: true, $nin: ["", null] };

function extractCategoryNames(tags: Array<{ name?: string; kind?: string }> = []): string[] {
  const seen = new Set<string>();
  return tags
    .filter((tag) => tag?.kind === "category" && typeof tag?.name === "string")
    .map((tag) => normalizeTagName(tag.name))
    .filter((name) => {
      const key = normalizeTagKey(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function resolveCategoryIds(category: unknown): Promise<string[] | null> {
  if (typeof category !== "string") return null;

  const value = category.trim();
  if (!value || value.toLowerCase() === "all") return null;

  const categoryTags = await Tag.find({
    kind: "category",
    name: new RegExp(`^${escapeRegex(value)}$`, "i"),
  }).select("_id");

  return categoryTags.map((tag) => String(tag._id));
}

// Unified media list (combines videos and podcasts)
router.get("/", async (req, res, next) => {
  // Disable ETag caching so fresh data is always returned
  res.setHeader("Cache-Control", "no-store");
  try {
    const { search, category, menu, mediaType, status } = req.query;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (status) filter.status = status;

  const resolvedCategoryIds = await resolveCategoryIds(category);
  if (resolvedCategoryIds?.length === 0) {
    return res.json({ data: [], meta: { page, limit, total: 0 } });
  }
  if (resolvedCategoryIds?.length) filter.tags = { $in: resolvedCategoryIds };

  let items: any[] = [];
  let total = 0;

  // Filter by menu (LiveTv = videos, Podcast = podcasts)
  if (menu === "LiveTv" || mediaType === "video") {
    const videoFilter = { ...filter };
    if (search) videoFilter.title = new RegExp(escapeRegex(search as string), "i");
    
    const [videos, count] = await Promise.all([
      Video.find(videoFilter).populate("tags", "name kind").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Video.countDocuments(videoFilter),
    ]);
    
    items = filterCanonicalMedia(videos as any[]).map((v) => ({
      id: v._id?.toString() ?? v.id,
      title: v.title,
      description: v.description,
      mediaType: "video",
      menu: "LiveTv",
      category: extractCategoryNames(v.tags)[0] || "",
      categories: extractCategoryNames(v.tags),
      tags: v.tags || [],
      duration: v.duration ? parseDuration(v.duration) : 0,
      fileUrl: v.streamUrl,
      thumbnailUrl: v.thumbnailUrl || "",
      status: v.status === "published" ? "ready" : "processing",
      views: v.views ?? 0,
      likes: v.likes ?? 0,
      commentsCount: v.commentsCount ?? 0,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
    total = count;
  } else if (menu === "Podcast" || mediaType === "audio") {
    const podcastFilter = { ...filter };
    podcastFilter.imageUrl = HAS_IMAGE;
    if (search) podcastFilter.title = new RegExp(escapeRegex(search as string), "i");
    
    const [podcasts, count] = await Promise.all([
      Podcast.find(podcastFilter).populate("tags", "name kind").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Podcast.countDocuments(podcastFilter),
    ]);
    
    items = filterCanonicalMedia(podcasts as any[]).map((p) => ({
      id: p._id?.toString() ?? p.id,
      title: p.title,
      description: p.description,
      mediaType: "audio",
      menu: "Podcast",
      category: extractCategoryNames(p.tags)[0] || "",
      categories: extractCategoryNames(p.tags),
      tags: p.tags || [],
      duration: p.duration ? parseDuration(p.duration) : 0,
      fileUrl: p.audioUrl,
      thumbnailUrl: p.imageUrl || "",
      status: p.status === "published" ? "ready" : "processing",
      views: p.views ?? 0,
      likes: p.likes ?? 0,
      commentsCount: p.commentsCount ?? 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    total = count;
  } else {
    // Return both if no menu filter
    const videoFilter = { ...filter };
    const podcastFilter = { ...filter };
    podcastFilter.imageUrl = HAS_IMAGE;
    if (search) {
      videoFilter.title = new RegExp(escapeRegex(search as string), "i");
      podcastFilter.title = new RegExp(escapeRegex(search as string), "i");
    }
    
    const [videos, podcasts, vCount, pCount] = await Promise.all([
      Video.find(videoFilter).populate("tags", "name kind").sort({ createdAt: -1 }).limit(limit),
      Podcast.find(podcastFilter).populate("tags", "name kind").sort({ createdAt: -1 }).limit(limit),
      Video.countDocuments(videoFilter),
      Podcast.countDocuments(podcastFilter),
    ]);
    
    const videoItems = filterCanonicalMedia(videos as any[]).map((v) => ({
      id: v._id?.toString() ?? v.id,
      title: v.title,
      description: v.description,
      mediaType: "video",
      menu: "LiveTv",
      category: extractCategoryNames(v.tags)[0] || "",
      categories: extractCategoryNames(v.tags),
      tags: v.tags || [],
      duration: v.duration ? parseDuration(v.duration) : 0,
      fileUrl: v.streamUrl,
      thumbnailUrl: v.thumbnailUrl || "",
      status: v.status === "published" ? "ready" : "processing",
      views: v.views ?? 0,
      likes: v.likes ?? 0,
      commentsCount: v.commentsCount ?? 0,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
    
    const podcastItems = filterCanonicalMedia(podcasts as any[]).map((p) => ({
      id: p._id?.toString() ?? p.id,
      title: p.title,
      description: p.description,
      mediaType: "audio",
      menu: "Podcast",
      category: extractCategoryNames(p.tags)[0] || "",
      categories: extractCategoryNames(p.tags),
      tags: p.tags || [],
      duration: p.duration ? parseDuration(p.duration) : 0,
      fileUrl: p.audioUrl,
      thumbnailUrl: p.imageUrl || "",
      status: p.status === "published" ? "ready" : "processing",
      views: p.views ?? 0,
      likes: p.likes ?? 0,
      commentsCount: p.commentsCount ?? 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    
    items = [...videoItems, ...podcastItems].sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ).slice(skip, skip + limit);
    
    total = vCount + pCount;
  }

  res.json({ data: items, meta: { page, limit, total } });
  } catch (err) { next(err); }
});

router.get("/categories", async (_req, res, next) => {
  try {
    const categoryTags = await Tag.find({ kind: "category" }).sort({ name: 1 }).select("name kind");
    const seen = new Set<string>();
    res.json({
      data: categoryTags
        .map((tag) => ({
          id: String(tag._id),
          name: normalizeTagName(tag.name),
          kind: tag.kind,
        }))
        .filter((tag) => {
          const key = `${tag.kind}:${normalizeTagKey(tag.name)}`;
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
    });
  } catch (err) { next(err); }
});

// Get single media item
router.get("/:id", async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id).populate("tags", "name kind");
    if (video) {
      return res.json({
        id: video.id,
        title: video.title,
        description: video.description,
        mediaType: "video",
        menu: "LiveTv",
        category: extractCategoryNames(video.tags as any[])[0] || "",
        categories: extractCategoryNames(video.tags as any[]),
        tags: video.tags || [],
        duration: video.duration ? parseDuration(video.duration) : 0,
        fileUrl: video.streamUrl,
        thumbnailUrl: video.thumbnailUrl || "",
        status: video.status === "published" ? "ready" : "processing",
        views: (video as any).views ?? 0,
        likes: (video as any).likes ?? 0,
        commentsCount: (video as any).commentsCount ?? 0,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      });
    }

    const podcast = await Podcast.findById(req.params.id).populate("tags", "name kind");
    if (podcast) {
      return res.json({
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        mediaType: "audio",
        menu: "Podcast",
        category: extractCategoryNames(podcast.tags as any[])[0] || "",
        categories: extractCategoryNames(podcast.tags as any[]),
        tags: podcast.tags || [],
        duration: podcast.duration ? parseDuration(podcast.duration) : 0,
        fileUrl: podcast.audioUrl,
        thumbnailUrl: podcast.imageUrl || "",
        status: podcast.status === "published" ? "ready" : "processing",
        views: (podcast as any).views ?? 0,
        likes: (podcast as any).likes ?? 0,
        commentsCount: (podcast as any).commentsCount ?? 0,
        createdAt: podcast.createdAt,
        updatedAt: podcast.updatedAt,
      });
    }

    return res.status(404).json({ error: "Media not found" });
  } catch (err) { next(err); }
});

const mediaSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  mediaType: z.enum(["video", "audio"]),
  menu: z.enum(["LiveTv", "Podcast"]),
  category: z.string().optional(),
  categories: z.array(z.string()).min(2, "At least 2 categories are required").optional(),
  tags: z.array(z.string()).optional().default([]),
  duration: z.number().optional(),
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  status: z.enum(["processing", "ready", "failed"]).optional().default("processing"),
});

// Create media (routes to video or podcast)
router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res, next) => {
  try {
    const parsed = mediaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;

  // Require at least 2 categories
  if (!data.categories || data.categories.length < 2) {
    return res.status(400).json({ error: "At least 2 categories are required" });
  }

  const tagIds = data.categories;
  const durationStr = data.duration ? formatDuration(data.duration) : undefined;

  if (data.mediaType === "video" || data.menu === "LiveTv") {
    const video = await Video.create({
      title: data.title,
      description: data.description,
      streamUrl: data.fileUrl || "",
      thumbnailUrl: data.thumbnailUrl || "",
      duration: durationStr,
      status: data.status === "ready" ? "published" : "draft",
      tags: tagIds,
      isLive: false,
    });
    return res.status(201).json({
      id: video.id,
      mediaType: "video",
      menu: "LiveTv",
      title: video.title,
      description: video.description,
      fileUrl: video.streamUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      status: video.status === "published" ? "ready" : "processing",
      categories: data.categories,
      tags: tagIds,
    });
  } else {
    const podcast = await Podcast.create({
      title: data.title,
      description: data.description,
      audioUrl: data.fileUrl || "",
      imageUrl: data.thumbnailUrl || "",
      duration: durationStr,
      status: data.status === "ready" ? "published" : "draft",
      tags: tagIds,
    });
    return res.status(201).json({
      id: podcast.id,
      mediaType: "audio",
      menu: "Podcast",
      title: podcast.title,
      description: podcast.description,
      fileUrl: podcast.audioUrl,
      thumbnailUrl: podcast.imageUrl,
      duration: podcast.duration,
      status: podcast.status === "published" ? "ready" : "processing",
      categories: data.categories,
      tags: tagIds,
    });
  }
  } catch (err) { next(err); }
});

// Update media
router.put("/:id", requireAuth(["superadmin", "admin", "editor"]), async (req, res, next) => {
  try {
    const parsed = mediaSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;

  // Enforce min 2 when categories are being updated
  if (data.categories !== undefined && data.categories.length < 2) {
    return res.status(400).json({ error: "At least 2 categories are required" });
  }

  // Try video first
  const video = await Video.findById(req.params.id);
  if (video) {
    if (data.title) video.title = data.title;
    if (data.description) video.description = data.description;
    if (data.fileUrl) video.streamUrl = data.fileUrl;
    if (data.thumbnailUrl) video.thumbnailUrl = data.thumbnailUrl;
    if (data.duration) video.duration = formatDuration(data.duration);
    if (data.status) video.status = data.status === "ready" ? "published" : "draft";
    if (data.categories?.length) video.tags = data.categories as any;
    else if (data.tags?.length) video.tags = data.tags as any;
    await video.save();
    return res.json({
      id: video.id,
      title: video.title,
      description: video.description,
      mediaType: "video",
      menu: "LiveTv",
      fileUrl: video.streamUrl,
      thumbnailUrl: video.thumbnailUrl,
      status: video.status === "published" ? "ready" : "processing",
    });
  }

  // Try podcast
  const podcast = await Podcast.findById(req.params.id);
  if (podcast) {
    if (data.title) podcast.title = data.title;
    if (data.description) podcast.description = data.description;
    if (data.fileUrl) podcast.audioUrl = data.fileUrl;
    if (data.thumbnailUrl) podcast.imageUrl = data.thumbnailUrl;
    if (data.duration) podcast.duration = formatDuration(data.duration);
    if (data.status) podcast.status = data.status === "ready" ? "published" : "draft";
    if (data.categories?.length) podcast.tags = data.categories as any;
    else if (data.tags?.length) podcast.tags = data.tags as any;
    await podcast.save();
    return res.json({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      mediaType: "audio",
      menu: "Podcast",
      fileUrl: podcast.audioUrl,
      thumbnailUrl: podcast.imageUrl,
      status: podcast.status === "published" ? "ready" : "processing",
    });
  }

  return res.status(404).json({ error: "Media not found" });
  } catch (err) { next(err); }
});

// Delete media
router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res, next) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (video) return res.status(204).send();

    const podcast = await Podcast.findByIdAndDelete(req.params.id);
    if (podcast) return res.status(204).send();

    return res.status(404).json({ error: "Media not found" });
  } catch (err) { next(err); }
});

// Update media status (PATCH endpoint for encoder callbacks)
router.patch("/:id/status", requireAuth(["superadmin", "admin", "editor"]), async (req, res, next) => {
  try {
    const parsed = z.object({
      status: z.enum(["processing", "ready", "failed"]),
      fileUrl: z.string().url().optional(),
      thumbnailUrl: z.string().url().optional(),
      duration: z.number().optional(),
    }).safeParse(req.body);

    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const data = parsed.data;

    // Try video first
    const video = await Video.findById(req.params.id);
    if (video) {
      video.status = data.status === "ready" ? "published" : "draft";
      if (data.fileUrl) video.streamUrl = data.fileUrl;
      if (data.thumbnailUrl) video.thumbnailUrl = data.thumbnailUrl;
      if (data.duration) video.duration = formatDuration(data.duration);
      await video.save();
      return res.json({
        id: video.id,
        status: data.status,
        fileUrl: video.streamUrl,
        thumbnailUrl: video.thumbnailUrl,
      });
    }

    // Try podcast
    const podcast = await Podcast.findById(req.params.id);
    if (podcast) {
      podcast.status = data.status === "ready" ? "published" : "draft";
      if (data.fileUrl) podcast.audioUrl = data.fileUrl;
      if (data.thumbnailUrl) podcast.imageUrl = data.thumbnailUrl;
      if (data.duration) podcast.duration = formatDuration(data.duration);
      await podcast.save();
      return res.json({
        id: podcast.id,
        status: data.status,
        fileUrl: podcast.audioUrl,
        thumbnailUrl: podcast.imageUrl,
      });
    }

    return res.status(404).json({ error: "Media not found" });
  } catch (err) { next(err); }
});

// Helper functions
function parseDuration(duration: string): number {
  // Parse "MM:SS" or "HH:MM:SS" to seconds
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default router;
