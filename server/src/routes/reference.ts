import { Router } from "express";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";
import { Post } from "../models/Post.js";
import { Tag } from "../models/Tag.js";

const router = Router();

// Get categories (aggregated from tags/content)
router.get("/categories", async (req, res) => {
  const type = (req.query.type as string | undefined)?.toLowerCase();
  const tags = await Tag.find({ kind: "category" }).sort({ name: 1 }).select("name kind");

  const data = tags.map((tag) => ({
    id: String(tag._id),
    name: tag.name,
    kind: tag.kind,
    appliesTo:
      type === "article"
        ? ["articles"]
        : type === "media"
          ? ["videos", "podcasts", "articles"]
          : ["videos", "podcasts", "articles"],
  }));

  res.json({ data });
});

// Get menus (static list)
router.get("/menus", async (_req, res) => {
  res.json({ data: ["LiveTv", "Podcast"] });
});

// Get tags (from Tag model, already exists but adding here for completeness)
router.get("/tags", async (req, res) => {
  const type = req.query.type as string | undefined;
  let tags: string[] = [];

  if (type === "article") {
    tags = (await Article.distinct("tags")).map(String);
  } else if (type === "media") {
    const videoTags = await Video.distinct("tags");
    const podcastTags = await Podcast.distinct("tags");
    tags = [...new Set([...videoTags.map(String), ...podcastTags.map(String)])];
  } else {
    // Return all tags from Tag model
    const allTags = await Tag.find().sort({ name: 1 });
    tags = allTags.map((t) => t.name);
  }

  res.json({ data: tags.sort() });
});

export default router;
