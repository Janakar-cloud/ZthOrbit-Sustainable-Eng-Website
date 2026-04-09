import { Router } from "express";
import auth from "./auth.js";
import live from "./live.js";
import videos from "./videos.js";
import podcasts from "./podcasts.js";
import articles from "./articles.js";
import tags from "./tags.js";
import uploads from "./uploads.js";
import admin from "./admin.js";
import users from "./users.js";
import media from "./media.js";
import notifications from "./notifications.js";
import reference from "./reference.js";
import search from "./search.js";
import home from "./home.js";
import sync from "./sync.js";
import engage from "./engage.js";
import logs from "./logs.js";

const router = Router();

router.use("/auth", auth);
router.use("/home", home);
router.use("/sync", sync);
router.use("/live", live);
router.use("/videos", videos);
router.use("/podcasts", podcasts);
router.use("/articles", articles);
router.use("/tags", tags);
router.use("/uploads", uploads);
router.use("/admin", admin);
router.use("/users", users);
// New unified routes
router.use("/media", media);
router.use("/notifications", notifications);
// Reference data endpoints
router.use("/reference", reference); // /reference/categories, /reference/menus, /reference/tags
// Global search
router.use("/search", search);
// Engagement: views, likes, trending, latest
router.use("/engage", engage);
// DB-backed logs (admin only)
router.use("/logs", logs);

export default router;
