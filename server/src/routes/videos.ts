import { Router } from "express";
import { z } from "zod";
import { Video } from "../models/Video.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Deprecation warning middleware
router.use((req, res, next) => {
  console.warn(
    `[DEPRECATED] /videos endpoint accessed. Migrate to /media?menu=LiveTv&mediaType=video. Legacy endpoint will be removed in v2.0.`
  );
  next();
});

router.get("/", async (req, res) => {
  const { tag, status } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);
  const skip = (page - 1) * pageSize;
  const filter: any = {};
  if (tag) filter.tags = tag;
  if (status) filter.status = status;
  const [items, total] = await Promise.all([
    Video.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Video.countDocuments(filter),
  ]);
  res.json({ items, total, page, pageSize });
});

const videoSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  streamUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional().default(""),
  duration: z.string().optional(),
  publishDate: z.string().datetime().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  isLive: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
});

router.post("/", requireAuth(["admin", "editor"]), async (req, res) => {
  const parsed = videoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const video = await Video.create({ ...parsed.data, publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : undefined });
  res.status(201).json(video);
});

router.put("/:id", requireAuth(["admin", "editor"]), async (req, res) => {
  const parsed = videoSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const video = await Video.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!video) return res.status(404).json({ error: "Not found" });
  res.json(video);
});

router.delete("/:id", requireAuth(["admin"]), async (req, res) => {
  const deleted = await Video.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

export default router;
