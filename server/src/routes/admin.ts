import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";
import { CaseStory } from "../models/CaseStory.js";
import { Post } from "../models/Post.js";
import { sendMail } from "../utils/mailer.js";
import { env } from "../config/env.js";

const router = Router();

router.get("/summary", requireAuth(["admin", "editor"]), async (req, res) => {
  // Get date range filters if provided
  const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();

  // Basic metrics
  const [users, videos, podcasts, articles, stories] = await Promise.all([
    User.countDocuments(),
    Video.countDocuments(),
    Podcast.countDocuments(),
    Article.countDocuments(),
    CaseStory.countDocuments(),
  ]);

  // User status breakdown
  const userStatusAgg = await User.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  
  const usersStatus = [
    { label: "Active", value: userStatusAgg.find((s) => s._id === "active")?.count || 0 },
    { label: "Inactive", value: userStatusAgg.find((s) => s._id === "inactive")?.count || 0 },
  ];

  // Trending podcast categories (sample data - would need actual view tracking)
  const podcastTags = await Podcast.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const trendingPodcastCategory = {
    categories: podcastTags.map((t) => t._id),
    series: [
      {
        name: "Podcasts",
        data: podcastTags.map((t) => t.count),
      },
    ],
  };

  // Trending article categories
  const articleTags = await Article.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const trendingArticleCategory = {
    categories: articleTags.map((t) => t._id),
    series: [
      {
        name: "Articles",
        data: articleTags.map((t) => t.count),
      },
    ],
  };

  // Recent activity (last 10 posts)
  const recentActivity = await Post.find().sort({ postedAt: -1 }).limit(10);

  res.json({
    metrics: {
      numberOfVideo: videos,
      totalUsers: users,
      onlineUsers: 0, // Would need real-time tracking
      totalPodcasts: podcasts,
    },
    trendingPodcastCategory,
    trendingArticleCategory,
    usersStatus,
    recentActivity,
  });
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
