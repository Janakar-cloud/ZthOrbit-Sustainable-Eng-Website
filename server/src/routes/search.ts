import { Router } from "express";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";
import { escapeRegex } from "../utils/regex.js";

const router = Router();

/**
 * Global search across all content types
 * GET /search?q=query&type=all|media|articles&limit=20
 */
router.get("/", async (req, res) => {
  const { q, type = "all", limit = "20" } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  const searchLimit = Math.min(Number(limit), 50); // Max 50 results per type
  const searchRegex = new RegExp(escapeRegex(q), "i");

  try {
    const results: any = {
      query: q,
      results: {
        media: [],
        articles: [],
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

    // Calculate total results
    results.totalResults =
      results.results.media.length +
      results.results.articles.length;

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
