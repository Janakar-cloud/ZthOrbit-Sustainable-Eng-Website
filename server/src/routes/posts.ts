import { Router } from "express";
import { z } from "zod";
import { Post } from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";
import { escapeRegex } from "../utils/regex.js";

const router = Router();

// List posts
router.get("/", async (req, res) => {
  const { search, category, sort } = req.query;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (search) filter.title = new RegExp(escapeRegex(search as string), "i");
  if (category) filter.category = category;

  let sortQuery: any = { postedAt: -1 }; // default: latest
  if (sort === "popular") sortQuery = { totalViews: -1 };
  else if (sort === "oldest") sortQuery = { postedAt: 1 };

  const [data, total] = await Promise.all([
    Post.find(filter).sort(sortQuery).skip(skip).limit(limit),
    Post.countDocuments(filter),
  ]);

  res.json({ data, meta: { page, limit, total } });
});

// Get single post
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  coverUrl: z.string().url(),
  totalViews: z.number().optional().default(0),
  totalComments: z.number().optional().default(0),
  totalShares: z.number().optional().default(0),
  totalFavorites: z.number().optional().default(0),
  postedAt: z.string().datetime().optional(),
  author: z.object({
    name: z.string().min(1),
    avatarUrl: z.string().url().optional(),
  }),
});

// Create post
router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const created = await Post.create({
    ...parsed.data,
    postedAt: parsed.data.postedAt ? new Date(parsed.data.postedAt) : new Date(),
  });

  res.status(201).json(created);
});

// Update post
router.put("/:id", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = postSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data: any = parsed.data;
  if (data.postedAt) data.postedAt = new Date(data.postedAt);

  const updated = await Post.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updated) return res.status(404).json({ error: "Post not found" });

  res.json(updated);
});

// Delete post
router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const deleted = await Post.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Post not found" });
  res.status(204).send();
});

export default router;
