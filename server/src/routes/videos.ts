import { Router } from "express";
import { z } from "zod";
import { Video } from "../models/Video.js";
import { requireAuth } from "../middleware/auth.js";
import { signStreamUrl } from "../utils/s3.js";
import { filterCanonicalMedia } from "../utils/mediaTitle.js";

const router = Router();
const HAS_THUMBNAIL = { $exists: true, $nin: ["", null] };

// Deprecation warning middleware
router.use((req, res, next) => {
  console.warn(
    `[DEPRECATED] /videos endpoint accessed. Migrate to /media?menu=LiveTv&mediaType=video. Legacy endpoint will be removed in v2.0.`
  );
  next();
});

router.get("/", async (req, res, next) => {
  try {
  const { tag, status } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);
  const skip = (page - 1) * pageSize;
  const filter: any = {};
  if (tag) filter.tags = tag;
  if (status) filter.status = status;
  filter.thumbnailUrl = HAS_THUMBNAIL;
  const [items, total] = await Promise.all([
    Video.find(filter)
      .sort({ seriesId: 1, partNumber: 1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("tags", "name kind"),
    Video.countDocuments(filter),
  ]);

  const canonicalItems = filterCanonicalMedia(items as any[]);

  // Sign every streamUrl so private S3 objects are accessible
  const signedItems = await Promise.all(
    canonicalItems.map(async (v) => {
      const obj = v.toObject() as any;
      obj.streamUrl = await signStreamUrl(obj.streamUrl || "");
      obj.thumbnailUrl = obj.thumbnailUrl ? await signStreamUrl(obj.thumbnailUrl) : "";
      return obj;
    })
  );

  res.json({ items: signedItems, total: canonicalItems.length, page, pageSize });
  } catch (err) { next(err); }
});

const videoSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  streamUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional().default(""),
  duration: z.string().optional(),
  publishDate: z.string().datetime().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  isLive: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
  seriesId: z.string().min(1).optional(),
  partNumber: z.number().int().positive().optional(),
  partTitle: z.string().min(1).optional(),
});

router.post("/", requireAuth(["superadmin", "admin", "editor"]), async (req, res, next) => {
  try {
  const parsed = videoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const video = await Video.create({ ...parsed.data, publishDate: parsed.data.publishDate ? new Date(parsed.data.publishDate) : undefined });
  res.status(201).json(video);
  } catch (err) { next(err); }
});

router.put("/:id", requireAuth(["superadmin", "admin", "editor"]), async (req, res, next) => {
  try {
  const parsed = videoSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const video = await Video.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  if (!video) return res.status(404).json({ error: "Not found" });
  res.json(video);
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth(["superadmin"]), async (req, res, next) => {
  try {
  const deleted = await Video.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
