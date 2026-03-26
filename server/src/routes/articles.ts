import { Router } from "express";
import { z } from "zod";
import { Article } from "../models/Article.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const { tag, featured, status, search } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);
  const skip = (page - 1) * pageSize;
  const filter: any = {};
  if (tag) filter.tags = tag;
  if (featured !== undefined) filter.featured = featured === "true";
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: new RegExp(search as string, "i") },
      { subtitle: new RegExp(search as string, "i") },
      { bodyMd: new RegExp(search as string, "i") },
    ];
  }
  const [items, total] = await Promise.all([
    Article.find(filter).sort({ publishDate: -1, createdAt: -1 }).skip(skip).limit(pageSize),
    Article.countDocuments(filter),
  ]);
  res.json({ items, total, page, pageSize });
});

router.get("/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ error: "Not found" });
  res.json(article);
});

const articleSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  bodyMd: z.string().default(""),
  readTime: z.string().optional(),
  coverImage: z.string().url().optional(),
  publishDate: z.string().datetime().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
});

router.post("/", requireAuth(["admin", "editor"]), async (req, res) => {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await Article.create({ ...parsed.data, publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : undefined });
  res.status(201).json(created);
});

router.put("/:id", requireAuth(["admin", "editor"]), async (req, res) => {
  const parsed = articleSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await Article.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

router.delete("/:id", requireAuth(["admin"]), async (req, res) => {
  const deleted = await Article.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

// PATCH endpoint for status updates (publish/draft)
router.patch("/:id/status", requireAuth(["admin", "editor"]), async (req, res) => {
  const parsed = z.object({
    status: z.enum(["published", "draft"]),
  }).safeParse(req.body);
  
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const updated = await Article.findByIdAndUpdate(
    req.params.id,
    { status: parsed.data.status },
    { new: true }
  );
  
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

export default router;
