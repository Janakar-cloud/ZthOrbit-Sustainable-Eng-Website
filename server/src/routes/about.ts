import { Router } from "express";
import { z } from "zod";
import { AboutBlock } from "../models/AboutBlock.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const { search } = req.query;
  const filter: any = {};
  
  if (search) {
    filter.$or = [
      { title: new RegExp(search as string, "i") },
      { body: new RegExp(search as string, "i") },
    ];
  }
  
  const blocks = await AboutBlock.find(filter).sort({ order: 1, createdAt: 1 });
  res.json(blocks);
});

const blockSchema = z.object({
  kind: z.enum(["theme", "timeline", "gallery", "cta"]),
  title: z.string(),
  body: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  order: z.number().int().default(0),
});

router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = blockSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await AboutBlock.create(parsed.data);
  res.status(201).json(created);
});

router.put("/:id", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = blockSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await AboutBlock.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const deleted = await AboutBlock.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

export default router;
