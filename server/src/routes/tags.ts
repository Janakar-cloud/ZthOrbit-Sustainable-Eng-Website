import { Router } from "express";
import { z } from "zod";
import { Tag } from "../models/Tag.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const tags = await Tag.find().sort({ name: 1 });
  res.json(tags);
});

const tagSchema = z.object({ name: z.string().min(1), kind: z.enum(["category", "topic", "role"]).default("category") });

router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = tagSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await Tag.create(parsed.data);
  res.status(201).json(created);
});

router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res) => {
  const deleted = await Tag.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

export default router;
