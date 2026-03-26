import { Router } from "express";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";
import { CaseStory } from "../models/CaseStory.js";
import { Post } from "../models/Post.js";

const router = Router();

/**
 * Global search across all content types
 * GET /search?q=query&type=all|media|articles|posts|caseStories&limit=20
 */
router.get("/", async (req, res) => {
  const { q, type = "all", limit = "20" } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  const searchLimit = Math.min(Number(limit), 50); // Max 50 results per type
  const searchRegex = new RegExp(q, "i");

  try {
    const results: any = {
      query: q,
      results: {
        media: [],
        articles: [],
        posts: [],
        caseStories: [],
      },
      totalResults: 0,
    };

    // Search Videos and Podcasts (Media)
    if (type === "all" || type === "media") {
      const [videos, podcasts] = await Promise.all([
        Video.find({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { tags: searchRegex },
          ],
        })
          .limit(searchLimit)
          .select("title description thumbnailUrl streamUrl duration publishDate status tags")
          .lean(),
        Podcast.find({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { tags: searchRegex },
          ],
        })
          .limit(searchLimit)
          .select("title description imageUrl audioUrl duration publishDate status tags")
          .lean(),
      ]);

      results.results.media = [
        ...videos.map((v: any) => ({
          id: v._id,
          type: "video",
          menu: "LiveTv",
          title: v.title,
          description: v.description,
          thumbnailUrl: v.thumbnailUrl,
          url: v.streamUrl,
          duration: v.duration,
          publishDate: v.publishDate,
          status: v.status,
          tags: v.tags,
        })),
        ...podcasts.map((p: any) => ({
          id: p._id,
          type: "podcast",
          menu: "Podcast",
          title: p.title,
          description: p.description,
          thumbnailUrl: p.imageUrl,
          url: p.audioUrl,
          duration: p.duration,
          publishDate: p.publishDate,
          status: p.status,
          tags: p.tags,
        })),
      ].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    }

    // Search Articles
    if (type === "all" || type === "articles") {
      const articles = await Article.find({
        $or: [
          { title: searchRegex },
          { subtitle: searchRegex },
          { bodyMd: searchRegex },
          { tags: searchRegex },
        ],
        status: "published", // Only published articles
      })
        .limit(searchLimit)
        .select("title subtitle coverImage publishDate readTime tags featured")
        .sort({ publishDate: -1 })
        .lean();

      results.results.articles = articles.map((a: any) => ({
        id: a._id,
        type: "article",
        title: a.title,
        subtitle: a.subtitle,
        coverImage: a.coverImage,
        publishDate: a.publishDate,
        readTime: a.readTime,
        tags: a.tags,
        featured: a.featured,
      }));
    }

    // Search Posts
    if (type === "all" || type === "posts") {
      const posts = await Post.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
      })
        .limit(searchLimit)
        .select("title description coverUrl totalViews totalComments postedAt author")
        .sort({ postedAt: -1 })
        .lean();

      results.results.posts = posts.map((p: any) => ({
        id: p._id,
        type: "post",
        title: p.title,
        description: p.description,
        coverUrl: p.coverUrl,
        totalViews: p.totalViews,
        totalComments: p.totalComments,
        postedAt: p.postedAt,
        author: p.author,
      }));
    }

    // Search Case Stories
    if (type === "all" || type === "caseStories") {
      const caseStories = await CaseStory.find({
        $or: [
          { title: searchRegex },
          { impact: searchRegex },
          { bodyMd: searchRegex },
          { tags: searchRegex },
        ],
      })
        .limit(searchLimit)
        .select("title impact heroImage duration tags")
        .sort({ createdAt: -1 })
        .lean();

      results.results.caseStories = caseStories.map((cs: any) => ({
        id: cs._id,
        type: "caseStory",
        title: cs.title,
        impact: cs.impact,
        heroImage: cs.heroImage,
        duration: cs.duration,
        tags: cs.tags,
      }));
    }

    // Calculate total results
    results.totalResults =
      results.results.media.length +
      results.results.articles.length +
      results.results.posts.length +
      results.results.caseStories.length;

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
