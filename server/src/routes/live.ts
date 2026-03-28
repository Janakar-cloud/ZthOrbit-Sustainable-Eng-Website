import { Router } from "express";
import { z } from "zod";
import { LiveConfig } from "../models/LiveConfig.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/config", async (_req, res) => {
  const config = await LiveConfig.findOne();
  if (!config) return res.json({ streamUrl: "", title: "", description: "" });
  res.json(config);
});

const liveSchema = z.object({
  streamUrl: z.string().url(),
  title: z.string().min(1),
  description: z.string().optional().default(""),
});

router.put("/config", requireAuth(["admin", "editor"]), async (req, res) => {
  const parsed = liveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;
  const config = await LiveConfig.findOneAndUpdate(
    {},
    { ...data, updatedBy: req.user?.email, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  res.json(config);
});

export default router;
