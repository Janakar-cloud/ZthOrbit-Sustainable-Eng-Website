import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import {
  createPresignedUpload,
  createMultipartUpload,
  createPresignedPartUpload,
  completeMultipartUpload,
  abortMultipartUpload,
} from "../utils/s3.js";

const router = Router();

// Allowed S3 key prefixes. Prevents callers from writing outside intended folders.
const ALLOWED_PREFIXES = ["videos", "podcasts", "articles", "thumbnails", "images", "covers", "LiveTV"];

// Allowed content types for upload. Prevents presigned URLs for executable content.
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif",
  "video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "video/x-msvideo",
  "audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/ogg", "audio/wav", "audio/aac", "audio/flac",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/html",
  "text/plain",
];

const prefixSchema = z.string().min(1).refine(
  (p) => ALLOWED_PREFIXES.some((a) => p === a || p.startsWith(`${a}/`)),
  { message: `prefix must start with one of: ${ALLOWED_PREFIXES.join(", ")}` }
);

const schema = z.object({
  prefix: prefixSchema,
  contentType: z.string().min(1).refine(
    (ct) => ALLOWED_CONTENT_TYPES.includes(ct.split(";")[0].trim().toLowerCase()),
    { message: `contentType must be one of the allowed media types` }
  ),
});

router.post("/presign", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { prefix, contentType } = parsed.data;
  const presign = await createPresignedUpload(prefix, contentType);
  res.json(presign);
});

// ─── Multipart upload endpoints ───────────────────────────────────────────────

/** Step 1 – Initiate a multipart upload. Returns { uploadId, key, fileUrl }. */
router.post("/presign/multipart/start", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = z.object({ prefix: prefixSchema }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const result = await createMultipartUpload(parsed.data.prefix);
  res.json(result);
});

/** Step 2 – Get a presigned PUT URL for one part. Returns { url }. */
router.post("/presign/multipart/part", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = z.object({
    key: z.string().min(1),
    uploadId: z.string().min(1),
    partNumber: z.number().int().min(1).max(10000),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { key, uploadId, partNumber } = parsed.data;
  const result = await createPresignedPartUpload(key, uploadId, partNumber);
  res.json(result);
});

/** Step 3 – Finalise the upload by submitting all ETags. */
router.post("/presign/multipart/complete", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = z.object({
    key: z.string().min(1),
    uploadId: z.string().min(1),
    parts: z.array(z.object({ PartNumber: z.number().int().min(1), ETag: z.string().min(1) })).min(1),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { key, uploadId, parts } = parsed.data;
  await completeMultipartUpload(key, uploadId, parts);
  res.json({ ok: true });
});

/** Abort – clean up an in-progress multipart upload. */
router.post("/presign/multipart/abort", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = z.object({
    key: z.string().min(1),
    uploadId: z.string().min(1),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { key, uploadId } = parsed.data;
  await abortMultipartUpload(key, uploadId);
  res.json({ ok: true });
});

export default router;
