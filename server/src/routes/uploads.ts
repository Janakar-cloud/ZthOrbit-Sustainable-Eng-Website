import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { createPresignedUpload } from "../utils/s3.js";

const router = Router();

const schema = z.object({
  prefix: z.string().min(1),
  contentType: z.string().min(1),
});

router.post("/presign", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { prefix, contentType } = parsed.data;
  const presign = await createPresignedUpload(prefix, contentType);
  res.json(presign);
});

export default router;
