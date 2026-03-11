import { Router } from "express";
import { z } from "zod";
import { Podcast } from "../models/Podcast.js";
import { PodcastComment } from "../models/PodcastComment.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const { tag, status } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);
  const skip = (page - 1) * pageSize;
  const filter: any = {};
  if (tag) filter.tags = tag;
  if (status) filter.status = status;
  const [items, total] = await Promise.all([
    Podcast.find(filter).sort({ publishDate: -1, createdAt: -1 }).skip(skip).limit(pageSize),
    Podcast.countDocuments(filter),
  ]);
  res.json({ items, total, page, pageSize });
});

const podcastSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  audioUrl: z.string().url(),
  imageUrl: z.string().url().optional(),
  duration: z.string().optional(),
  publishDate: z.string().datetime().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  tags: z.array(z.string()).optional().default([]),
});

router.post("/", requireAuth(["admin", "editor"]), async (req, res) => {
  const parsed = podcastSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await Podcast.create({ ...parsed.data, publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : undefined });
  res.status(201).json(created);
});

router.put("/:id", requireAuth(["admin", "editor"]), async (req, res) => {
  const parsed = podcastSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await Podcast.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

router.delete("/:id", requireAuth(["admin"]), async (req, res) => {
  const deleted = await Podcast.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

const commentSchema = z.object({ author: z.string().min(1), message: z.string().min(1) });

router.post("/:id/comments", async (req, res) => {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const exists = await Podcast.findById(req.params.id);
  if (!exists) return res.status(404).json({ error: "Podcast not found" });
  const comment = await PodcastComment.create({ podcastId: exists._id, ...parsed.data, createdAt: new Date(), status: "visible" });
  res.status(201).json(comment);
});

router.get("/:id/comments", async (req, res) => {
  const comments = await PodcastComment.find({ podcastId: req.params.id, status: "visible" }).sort({ createdAt: -1 });
  res.json(comments);
});

export default router;
