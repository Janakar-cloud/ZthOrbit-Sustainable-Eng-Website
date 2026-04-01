import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { syncS3ToDb } from "../utils/s3Sync.js";

const router = Router();

/**
 * POST /api/v1/sync/s3
 * Manually trigger an S3 → DB sync. Admin/superadmin only.
 */
router.post("/s3", requireAuth(["admin", "superadmin"]), async (_req, res) => {
  try {
    const result = await syncS3ToDb();
    res.json({
      message: "S3 sync complete",
      ...result,
    });
  } catch (err) {
    console.error("[S3 Sync]", err);
    res.status(500).json({ error: "S3 sync failed", detail: (err as Error).message });
  }
});

export default router;
