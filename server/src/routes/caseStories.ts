import { Router } from "express";
import { z } from "zod";
import { CaseStory } from "../models/CaseStory.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const { tag, search } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);
  const skip = (page - 1) * pageSize;
  const filter: any = {};
  if (tag) filter.tags = tag;
  if (search) {
    filter.$or = [
      { title: new RegExp(search as string, "i") },
      { impact: new RegExp(search as string, "i") },
      { bodyMd: new RegExp(search as string, "i") },
    ];
  }
  const [items, total] = await Promise.all([
    CaseStory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    CaseStory.countDocuments(filter),
  ]);
  res.json({ items, total, page, pageSize });
});

router.get("/:id", async (req, res) => {
  const story = await CaseStory.findById(req.params.id);
  if (!story) return res.status(404).json({ error: "Not found" });
  res.json(story);
});

const metricSchema = z.object({ label: z.string(), value: z.string() });
const storySchema = z.object({
  title: z.string().min(1),
  impact: z.string().default(""),
  duration: z.string().optional(),
  heroImage: z.string().url().optional(),
  metrics: z.array(metricSchema).optional(),
  bodyMd: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = storySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await CaseStory.create(parsed.data);
  res.status(201).json(created);
});

router.put("/:id", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = storySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await CaseStory.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const deleted = await CaseStory.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

export default router;
