import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";
import { sendMail } from "../utils/mailer.js";
import { env } from "../config/env.js";

const router = Router();

router.get("/summary", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  // Get date range filters if provided
  const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();

  // Basic metrics
  const onlineThreshold = new Date(Date.now() - 5 * 60 * 1000); // active in last 5 min
  const [users, videos, podcasts, articles, onlineUsers] = await Promise.all([
    User.countDocuments(),
    Video.countDocuments(),
    Podcast.countDocuments(),
    Article.countDocuments(),
    User.countDocuments({ lastActiveAt: { $gte: onlineThreshold } }),
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

  // Trending podcast categories (via tag $lookup to resolve names)
  const podcastTagsRaw = await Podcast.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $unwind: { path: "$tags", preserveNullAndEmpty: false } },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: "tags", localField: "_id", foreignField: "_id", as: "tagDoc" } },
    { $unwind: { path: "$tagDoc", preserveNullAndEmpty: true } },
  ]);

  const trendingPodcastCategory =
    podcastTagsRaw.length > 0
      ? {
          categories: podcastTagsRaw.map((t: any) => t.tagDoc?.name ?? "Unknown"),
          series: [{ name: "Podcasts", data: podcastTagsRaw.map((t: any) => t.count) }],
        }
      : { categories: ["No data"], series: [{ name: "Podcasts", data: [0] }] };

  // Trending article categories (via tag $lookup to resolve names)
  const articleTagsRaw = await Article.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $unwind: { path: "$tags", preserveNullAndEmpty: false } },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: "tags", localField: "_id", foreignField: "_id", as: "tagDoc" } },
    { $unwind: { path: "$tagDoc", preserveNullAndEmpty: true } },
  ]);

  const trendingArticleCategory =
    articleTagsRaw.length > 0
      ? {
          categories: articleTagsRaw.map((t: any) => t.tagDoc?.name ?? "Unknown"),
          series: [{ name: "Articles", data: articleTagsRaw.map((t: any) => t.count) }],
        }
      : { categories: ["No data"], series: [{ name: "Articles", data: [0] }] };

  // Recent activity: latest published videos, podcasts, articles
  const [recentVideos, recentPodcasts, recentArticles] = await Promise.all([
    Video.find({ status: "published" }).sort({ createdAt: -1 }).limit(5).lean(),
    Podcast.find({ status: "published" }).sort({ createdAt: -1 }).limit(5).lean(),
    Article.find({ status: "published" }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const recentActivity = [
    ...recentVideos.map((v: any) => ({
      id: String(v._id),
      title: v.title,
      description: v.description || "Video",
      coverUrl: v.thumbnailUrl || "",
      postedAt: v.createdAt?.toISOString() ?? "",
    })),
    ...recentPodcasts.map((p: any) => ({
      id: String(p._id),
      title: p.title,
      description: p.description || "Podcast",
      coverUrl: p.imageUrl || "",
      postedAt: p.createdAt?.toISOString() ?? "",
    })),
    ...recentArticles.map((a: any) => ({
      id: String(a._id),
      title: a.title,
      description: a.subtitle || a.bodyMd?.slice(0, 80) || "Article",
      coverUrl: a.coverImage || "",
      postedAt: a.createdAt?.toISOString() ?? "",
    })),
  ]
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, 8);

  res.json({
    metrics: {
      numberOfVideo: videos,
      totalUsers: users,
      onlineUsers,
      totalPodcasts: podcasts,
      totalArticles: articles,
    },
    trendingPodcastCategory,
    trendingArticleCategory,
    usersStatus,
    recentActivity,
  });
});

router.post("/test-email", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
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
