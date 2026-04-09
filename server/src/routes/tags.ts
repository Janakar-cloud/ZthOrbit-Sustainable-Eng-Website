import { Router } from "express";
import { z } from "zod";
import { Tag, normalizeTagKey, normalizeTagName } from "../models/Tag.js";
import { requireAuth } from "../middleware/auth.js";
import { escapeRegex } from "../utils/regex.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    const seen = new Set<string>();
    const deduped = tags.filter((tag) => {
      const key = `${tag.kind}:${normalizeTagKey(tag.name)}`;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    res.json(deduped);
  } catch (err) { next(err); }
});

const tagSchema = z.object({ name: z.string().min(1), kind: z.enum(["category", "topic", "role"]).default("category") });

router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res, next) => {
  try {
    const parsed = tagSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const normalizedName = normalizeTagName(parsed.data.name);
    const existing = await Tag.findOne({
      kind: parsed.data.kind,
      name: new RegExp(`^${escapeRegex(normalizedName)}$`, "i"),
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const created = await Tag.create({ ...parsed.data, name: normalizedName });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth(["superadmin", "admin"]), async (req, res, next) => {
  try {
    const deleted = await Tag.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
