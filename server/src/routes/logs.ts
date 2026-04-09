import { Router } from "express";
import { z } from "zod";
import { AppLog } from "../models/AppLog.js";
import { requireAuth } from "../middleware/auth.js";
import { escapeRegex } from "../utils/regex.js";

const router = Router();

// All log endpoints are superadmin/admin only
router.use(requireAuth(["superadmin", "admin"]));

// ─── GET /logs ────────────────────────────────────────────────────────────────
// Query params: level, source, limit (default 100, max 500), page, search
router.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.level) filter.level = req.query.level;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.search) {
      filter.message = { $regex: escapeRegex(String(req.query.search)), $options: "i" };
    }
    if (req.query.from || req.query.to) {
      const range: Record<string, Date> = {};
      if (req.query.from) range.$gte = new Date(String(req.query.from));
      if (req.query.to) range.$lte = new Date(String(req.query.to));
      filter.createdAt = range;
    }

    const [items, total] = await Promise.all([
      AppLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AppLog.countDocuments(filter),
    ]);

    res.json({ data: items, meta: { page, limit, total } });
  } catch (err) { next(err); }
});

// ─── POST /logs ───────────────────────────────────────────────────────────────
// Manually write a log entry (useful for client-side error reporting)
const writeSchema = z.object({
  level: z.enum(["info", "warn", "error", "debug"]).default("info"),
  message: z.string().min(1).max(2000),
  source: z.string().max(100).optional(),
  meta: z.record(z.unknown()).optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = writeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const reqAny = req as any;
    const log = await AppLog.create({
      ...parsed.data,
      userId: reqAny.user?.id ?? reqAny.user?._id,
      ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip,
    });

    res.status(201).json(log);
  } catch (err) { next(err); }
});

// ─── DELETE /logs ──────────────────────────────────────────────────────────────
// Bulk delete by level or older than N days (superadmin only)
router.delete("/", requireAuth(["superadmin"]), async (req, res, next) => {
  try {
    const olderThanDays = Number(req.query.olderThanDays || 0);
    const level = req.query.level as string | undefined;

    const filter: Record<string, unknown> = {};
    if (olderThanDays > 0) {
      filter.createdAt = { $lt: new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000) };
    }
    if (level) filter.level = level;

    if (!Object.keys(filter).length) {
      return res.status(400).json({ error: "Provide olderThanDays or level to avoid deleting all logs" });
    }

    const result = await AppLog.deleteMany(filter);
    res.json({ deleted: result.deletedCount });
  } catch (err) { next(err); }
});

export default router;
