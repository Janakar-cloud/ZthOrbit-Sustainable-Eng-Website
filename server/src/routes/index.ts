import { Router } from "express";
import auth from "./auth.js";
import live from "./live.js";
import videos from "./videos.js";
import podcasts from "./podcasts.js";
import articles from "./articles.js";
import caseStories from "./caseStories.js";
import about from "./about.js";
import tags from "./tags.js";
import uploads from "./uploads.js";
import admin from "./admin.js";
import users from "./users.js";

const router = Router();

router.use("/auth", auth);
router.use("/live", live);
router.use("/videos", videos);
router.use("/podcasts", podcasts);
router.use("/articles", articles);
router.use("/case-stories", caseStories);
router.use("/about", about);
router.use("/tags", tags);
router.use("/uploads", uploads);
router.use("/admin", admin);
router.use("/users", users);

export default router;
