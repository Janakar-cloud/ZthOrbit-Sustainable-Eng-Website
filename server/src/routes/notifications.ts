import { Router } from "express";
import { z } from "zod";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// List notifications for current user
router.get("/", requireAuth(["superadmin", "admin", "editor", "viewer"]), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const filter: any = { userId: req.user!.id };
    if (req.query.isUnread !== undefined) {
      filter.isUnread = req.query.isUnread === "true";
    }

    const [data, total] = await Promise.all([
      Notification.find(filter).sort({ postedAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    res.json({
      data: data.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        avatarUrl: n.avatarUrl,
        type: n.type,
        postedAt: n.postedAt,
        isUnread: n.isUnread,
      })),
      meta: { page, limit, total },
    });
  } catch (err) { next(err); }
});

// Mark all as read — must be registered BEFORE /:id to avoid Express matching "read-all" as an id
router.patch("/read-all", requireAuth(["superadmin", "admin", "editor", "viewer"]), async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user!.id, isUnread: true }, { isUnread: false });
    res.status(204).send();
  } catch (err) { next(err); }
});

// Mark notification as read/unread
router.patch("/:id", requireAuth(["superadmin", "admin", "editor", "viewer"]), async (req, res, next) => {
  try {
    const parsed = z.object({ isUnread: z.boolean() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!notification) return res.status(404).json({ error: "Notification not found" });

    notification.isUnread = parsed.data.isUnread;
    await notification.save();

    res.json({
      id: notification.id,
      title: notification.title,
      description: notification.description,
      avatarUrl: notification.avatarUrl,
      type: notification.type,
      postedAt: notification.postedAt,
      isUnread: notification.isUnread,
    });
  } catch (err) { next(err); }
});

// Delete single notification
router.delete("/:id", requireAuth(["superadmin", "admin", "editor", "viewer"]), async (req, res, next) => {
  try {
    const deleted = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
    if (!deleted) return res.status(404).json({ error: "Notification not found" });
    res.status(204).send();
  } catch (err) { next(err); }
});

// Delete all notifications for current user
router.delete("/", requireAuth(["superadmin", "admin", "editor", "viewer"]), async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user!.id });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
