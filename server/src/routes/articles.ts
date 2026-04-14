import { Router } from "express";
import { z } from "zod";
import { Article } from "../models/Article.js";
import { requireAuth } from "../middleware/auth.js";
import { escapeRegex } from "../utils/regex.js";

const router = Router();
const HAS_IMAGE = { $exists: true, $nin: ["", null] };

router.get("/", async (req, res, next) => {
  try {
  const { tag, featured, status, search } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);
  const skip = (page - 1) * pageSize;
  const filter: any = {};
  if (tag) filter.tags = tag;
  if (featured !== undefined) filter.featured = featured === "true";
  filter.status = (status as string) || "published";
  filter.coverImage = HAS_IMAGE;
  if (search) {
    const safe = escapeRegex(search as string);
    filter.$or = [
      { title: new RegExp(safe, "i") },
      { subtitle: new RegExp(safe, "i") },
      { bodyMd: new RegExp(safe, "i") },
    ];
  }
  const [items, total] = await Promise.all([
    Article.find(filter).populate("tags", "name kind").sort({ publishDate: -1, createdAt: -1 }).skip(skip).limit(pageSize),
    Article.countDocuments(filter),
  ]);
  res.json({ items, total, page, pageSize });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
  const article = await Article.findById(req.params.id).populate("tags", "name kind");
  if (!article) return res.status(404).json({ error: "Not found" });
  res.json(article);
  } catch (err) { next(err); }
});

const articleSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  bodyMd: z.string().default(""),
  // Accept raw HTML from the dashboard editor OR an S3 URL (both are valid)
  bodyHtml: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional()
  ),
  readTime: z.string().optional(),
  // Empty string counts as "no cover image" — strip it before URL-validating
  coverImage: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().url().optional()
  ),
  // Accept full ISO datetime OR date-only strings (new Date() handles both)
  publishDate: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().optional().refine(
      (v) => !v || !isNaN(Date.parse(v)),
      { message: "publishDate must be a valid date string" }
    )
  ),
  status: z.enum(["draft", "published"]).default("published"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
});

router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res, next) => {
  try {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await Article.create({ ...parsed.data, publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : undefined });
  res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put("/:id", requireAuth(["superadmin", "admin", "editor"]), async (req, res, next) => {
  try {
  const parsed = articleSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await Article.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res, next) => {
  try {
  const deleted = await Article.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
  } catch (err) { next(err); }
});

// PATCH endpoint for status updates (publish/draft)
router.patch("/:id/status", requireAuth(["superadmin", "admin", "editor"]), async (req, res, next) => {
  try {
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
  } catch (err) { next(err); }
});

export default router;
