import { Router } from "express";
import { z } from "zod";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { requireAuth } from "../middleware/auth.js";
import { escapeRegex } from "../utils/regex.js";

const router = Router();

// Unified media list (combines videos and podcasts)
router.get("/", async (req, res) => {
  const { search, category, menu, mediaType, status } = req.query;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (category) filter.tags = category;
  if (status) filter.status = status;

  let items: any[] = [];
  let total = 0;

  // Filter by menu (LiveTv = videos, Podcast = podcasts)
  if (menu === "LiveTv" || mediaType === "video") {
    const videoFilter = { ...filter };
    if (search) videoFilter.title = new RegExp(escapeRegex(search as string), "i");
    
    const [videos, count] = await Promise.all([
      Video.find(videoFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Video.countDocuments(videoFilter),
    ]);
    
    items = videos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      mediaType: "video",
      menu: "LiveTv",
      category: v.tags?.[0] || "",
      tags: v.tags || [],
      duration: v.duration ? parseDuration(v.duration) : 0,
      fileUrl: v.streamUrl,
      thumbnailUrl: v.thumbnailUrl || "",
      status: v.status === "published" ? "ready" : "processing",
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
    total = count;
  } else if (menu === "Podcast" || mediaType === "audio") {
    const podcastFilter = { ...filter };
    if (search) podcastFilter.title = new RegExp(escapeRegex(search as string), "i");
    
    const [podcasts, count] = await Promise.all([
      Podcast.find(podcastFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Podcast.countDocuments(podcastFilter),
    ]);
    
    items = podcasts.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      mediaType: "audio",
      menu: "Podcast",
      category: p.tags?.[0] || "",
      tags: p.tags || [],
      duration: p.duration ? parseDuration(p.duration) : 0,
      fileUrl: p.audioUrl,
      thumbnailUrl: p.imageUrl || "",
      status: p.status === "published" ? "ready" : "processing",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    total = count;
  } else {
    // Return both if no menu filter
    const videoFilter = { ...filter };
    const podcastFilter = { ...filter };
    if (search) {
      videoFilter.title = new RegExp(escapeRegex(search as string), "i");
      podcastFilter.title = new RegExp(escapeRegex(search as string), "i");
    }
    
    const [videos, podcasts, vCount, pCount] = await Promise.all([
      Video.find(videoFilter).sort({ createdAt: -1 }).limit(limit),
      Podcast.find(podcastFilter).sort({ createdAt: -1 }).limit(limit),
      Video.countDocuments(videoFilter),
      Podcast.countDocuments(podcastFilter),
    ]);
    
    const videoItems = videos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      mediaType: "video",
      menu: "LiveTv",
      category: v.tags?.[0] || "",
      tags: v.tags || [],
      duration: v.duration ? parseDuration(v.duration) : 0,
      fileUrl: v.streamUrl,
      thumbnailUrl: v.thumbnailUrl || "",
      status: v.status === "published" ? "ready" : "processing",
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
    
    const podcastItems = podcasts.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      mediaType: "audio",
      menu: "Podcast",
      category: p.tags?.[0] || "",
      tags: p.tags || [],
      duration: p.duration ? parseDuration(p.duration) : 0,
      fileUrl: p.audioUrl,
      thumbnailUrl: p.imageUrl || "",
      status: p.status === "published" ? "ready" : "processing",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    
    items = [...videoItems, ...podcastItems].sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ).slice(skip, skip + limit);
    
    total = vCount + pCount;
  }

  res.json({ data: items, meta: { page, limit, total } });
});

// Get single media item
router.get("/:id", async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (video) {
    return res.json({
      id: video.id,
      title: video.title,
      description: video.description,
      mediaType: "video",
      menu: "LiveTv",
      category: video.tags?.[0] || "",
      tags: video.tags || [],
      duration: video.duration ? parseDuration(video.duration) : 0,
      fileUrl: video.streamUrl,
      thumbnailUrl: video.thumbnailUrl || "",
      status: video.status === "published" ? "ready" : "processing",
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    });
  }

  const podcast = await Podcast.findById(req.params.id);
  if (podcast) {
    return res.json({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      mediaType: "audio",
      menu: "Podcast",
      category: podcast.tags?.[0] || "",
      tags: podcast.tags || [],
      duration: podcast.duration ? parseDuration(podcast.duration) : 0,
      fileUrl: podcast.audioUrl,
      thumbnailUrl: podcast.imageUrl || "",
      status: podcast.status === "published" ? "ready" : "processing",
      createdAt: podcast.createdAt,
      updatedAt: podcast.updatedAt,
    });
  }

  return res.status(404).json({ error: "Media not found" });
});

const mediaSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  mediaType: z.enum(["video", "audio"]),
  menu: z.enum(["LiveTv", "Podcast"]),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  duration: z.number().optional(),
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  status: z.enum(["processing", "ready", "failed"]).optional().default("processing"),
});

// Create media (routes to video or podcast)
router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = mediaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;
  const durationStr = data.duration ? formatDuration(data.duration) : undefined;

  if (data.mediaType === "video" || data.menu === "LiveTv") {
    const video = await Video.create({
      title: data.title,
      description: data.description,
      streamUrl: data.fileUrl || "",
      thumbnailUrl: data.thumbnailUrl || "",
      duration: durationStr,
      status: data.status === "ready" ? "published" : "draft",
      tags: data.tags.length > 0 ? data.tags : [data.category || "uncategorized"],
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
      category: data.category,
      tags: data.tags,
    });
  } else {
    const podcast = await Podcast.create({
      title: data.title,
      description: data.description,
      audioUrl: data.fileUrl || "",
      imageUrl: data.thumbnailUrl || "",
      duration: durationStr,
      status: data.status === "ready" ? "published" : "draft",
      tags: data.tags.length > 0 ? data.tags : [data.category || "uncategorized"],
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
      category: data.category,
      tags: data.tags,
    });
  }
});

// Update media
router.put("/:id", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = mediaSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;

  // Try video first
  const video = await Video.findById(req.params.id);
  if (video) {
    if (data.title) video.title = data.title;
    if (data.description) video.description = data.description;
    if (data.fileUrl) video.streamUrl = data.fileUrl;
    if (data.thumbnailUrl) video.thumbnailUrl = data.thumbnailUrl;
    if (data.duration) video.duration = formatDuration(data.duration);
    if (data.status) video.status = data.status === "ready" ? "published" : "draft";
    if (data.tags) video.tags = data.tags as any;
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
    if (data.tags) podcast.tags = data.tags as any;
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
});

// Delete media
router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const video = await Video.findByIdAndDelete(req.params.id);
  if (video) return res.status(204).send();

  const podcast = await Podcast.findByIdAndDelete(req.params.id);
  if (podcast) return res.status(204).send();

  return res.status(404).json({ error: "Media not found" });
});

// Update media status (PATCH endpoint for encoder callbacks)
router.patch("/:id/status", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
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
