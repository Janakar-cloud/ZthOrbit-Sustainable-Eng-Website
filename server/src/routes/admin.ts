import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";
import { CaseStory } from "../models/CaseStory.js";
import { sendMail } from "../utils/mailer.js";
import { env } from "../config/env.js";

const router = Router();

router.get("/summary", requireAuth(["admin", "editor"]), async (_req, res) => {
  const [users, videos, podcasts, articles, stories] = await Promise.all([
    User.countDocuments(),
    Video.countDocuments(),
    Podcast.countDocuments(),
    Article.countDocuments(),
    CaseStory.countDocuments(),
  ]);
  res.json({ users, videos, podcasts, articles, caseStories: stories });
});

router.post("/test-email", requireAuth(["admin", "editor"]), async (req, res) => {
  const to = (req.body?.to as string) || env.smtp.user;
  if (!to) return res.status(400).json({ error: "Provide 'to' or set SMTP_USER" });
  try {
    await sendMail(to, "SMTP test", `<p>This is a test email from ZthOrbit backend.</p>`);
    res.json({ success: true, to });
  } catch (err: any) {
    console.error("[mailer:test]", err);
    res.status(500).json({ error: err?.message || "Failed to send" });
  }
});

export default router;
