import { Router } from "express";
import { z } from "zod";
import { Podcast } from "../models/Podcast.js";
import { PodcastComment } from "../models/PodcastComment.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const HAS_IMAGE = { $exists: true, $nin: ["", null] };

// Deprecation warning middleware
router.use((req, res, next) => {
  console.warn(
    `[DEPRECATED] /podcasts endpoint accessed. Migrate to /media?menu=Podcast&mediaType=audio. Legacy endpoint will be removed in v2.0.`
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
  filter.imageUrl = HAS_IMAGE;
  const [items, total] = await Promise.all([
    Podcast.find(filter).populate("tags", "name kind").sort({ publishDate: -1, createdAt: -1 }).skip(skip).limit(pageSize),
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

router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = podcastSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await Podcast.create({ ...parsed.data, publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : undefined });
  res.status(201).json(created);
});

router.put("/:id", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = podcastSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await Podcast.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const deleted = await Podcast.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

// Toggle commentsEnabled for a podcast
router.patch("/:id/settings", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const settingsSchema = z.object({ commentsEnabled: z.boolean() });
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await Podcast.findByIdAndUpdate(
    req.params.id,
    { commentsEnabled: parsed.data.commentsEnabled },
    { new: true, select: "commentsEnabled" }
  );
  if (!updated) return res.status(404).json({ error: "Podcast not found" });
  res.json({ commentsEnabled: updated.commentsEnabled });
});

const commentSchema = z.object({
  author: z.string().min(1),
  message: z.string().min(1),
  parentCommentId: z.string().optional(),
});

router.post("/:id/comments", async (req, res) => {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const exists = await Podcast.findById(req.params.id);
  if (!exists) return res.status(404).json({ error: "Podcast not found" });
  if (exists.commentsEnabled === false) return res.status(403).json({ error: "Comments are disabled for this podcast" });

  if (parsed.data.parentCommentId) {
    const parent = await PodcastComment.findOne({ _id: parsed.data.parentCommentId, podcastId: req.params.id });
    if (!parent) return res.status(400).json({ error: "Parent comment not found for this podcast" });
  }

  const comment = await PodcastComment.create({ podcastId: exists._id, ...parsed.data, createdAt: new Date(), status: "visible" });
  await Podcast.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
  res.status(201).json(comment);
});

router.get("/:id/comments", async (req, res) => {
  const podcast = await Podcast.findById(req.params.id).select("commentsEnabled");
  if (!podcast) return res.status(404).json({ error: "Podcast not found" });
  const comments = await PodcastComment.find({ podcastId: req.params.id, status: "visible" }).sort({ createdAt: 1 });
  res.json({ commentsEnabled: podcast.commentsEnabled ?? true, comments });
});

// Admin: Get all comments (including hidden)
router.get("/:id/comments/all", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const comments = await PodcastComment.find({ podcastId: req.params.id }).sort({ createdAt: -1 });
  res.json(comments);
});

// Moderate comment (hide/show)
router.patch("/:podcastId/comments/:commentId/status", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const statusSchema = z.object({ status: z.enum(["visible", "hidden"]) });
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const comment = await PodcastComment.findOneAndUpdate(
    { _id: req.params.commentId, podcastId: req.params.podcastId },
    { status: parsed.data.status },
    { new: true }
  );
  
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  res.json(comment);
});

// Delete comment
router.delete("/:podcastId/comments/:commentId", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const comment = await PodcastComment.findOneAndDelete({
    _id: req.params.commentId,
    podcastId: req.params.podcastId,
  });
  
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  await Podcast.findByIdAndUpdate(req.params.podcastId, { $inc: { commentsCount: -1 } });
