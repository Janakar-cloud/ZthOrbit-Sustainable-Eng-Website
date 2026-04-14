import { Router } from "express";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { requireAuth } from "../middleware/auth.js";
import { syncS3ToDb } from "../utils/s3Sync.js";
import { s3, signStreamUrl } from "../utils/s3.js";
import { env } from "../config/env.js";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";

const router = Router();

/** POST /api/v1/sync/s3 — manual sync */
router.post("/s3", requireAuth(["admin", "superadmin"]), async (_req, res) => {
  try {
    const result = await syncS3ToDb();
    res.json({ message: "S3 sync complete", ...result });
  } catch (err) {
    console.error("[S3 Sync]", err);
    res.status(500).json({ error: "S3 sync failed", detail: (err as Error).message });
  }
});

/**
 * GET /api/v1/sync/diagnose
 * Compares what's in S3 vs what's stored in DB.
 * Shows exactly which keys are missing / mismatched so 404s can be debugged.
 */
router.get("/diagnose", requireAuth(["admin", "superadmin"]), async (_req, res) => {
  try {
    const listKeys = async (prefix: string): Promise<string[]> => {
      const keys: string[] = [];
      let token: string | undefined;
      do {
        const cmd = new ListObjectsV2Command({ Bucket: env.s3.bucket, Prefix: prefix, ContinuationToken: token });
        const resp = await s3.send(cmd);
        (resp.Contents || []).forEach(o => o.Key && keys.push(o.Key));
        token = resp.NextContinuationToken;
      } while (token);
      return keys;
    };

    const [s3VideoKeys, s3PodcastKeys, dbVideos, dbPodcasts] = await Promise.all([
      listKeys("videos/"),
      listKeys("podcast/"),
      Video.find({}, "title streamUrl thumbnailUrl").lean(),
      Podcast.find({}, "title audioUrl thumbnailUrl").lean(),
    ]);

    const bucketBase = `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/`;

    const diagnoseItems = async (
      dbItems: Array<{ title: string; streamUrl?: string; audioUrl?: string; thumbnailUrl?: string }>,
      s3Keys: string[],
      urlField: "streamUrl" | "audioUrl"
    ) => {
      return Promise.all(dbItems.map(async item => {
        const storedUrl: string = (item as any)[urlField] || "";
        const key = storedUrl.startsWith(bucketBase)
          ? decodeURIComponent(storedUrl.slice(bucketBase.length))
          : storedUrl;
        const existsInS3 = s3Keys.includes(key);
        const signedUrl = existsInS3 ? await signStreamUrl(storedUrl).catch(() => "sign-error") : null;
        return {
          title: item.title,
          storedKey: key,
          existsInS3,
          signedUrl,
          thumbnailUrl: item.thumbnailUrl || null,
        };
      }));
    };

    const [videos, podcasts] = await Promise.all([
      diagnoseItems(dbVideos as any, s3VideoKeys, "streamUrl"),
      diagnoseItems(dbPodcasts as any, s3PodcastKeys, "audioUrl"),
    ]);

    res.json({
      bucket: env.s3.bucket,
      region: env.s3.region,
      s3: { videoKeys: s3VideoKeys, podcastKeys: s3PodcastKeys },
      db: { videos, podcasts },
      summary: {
        s3Videos: s3VideoKeys.length,
        s3Podcasts: s3PodcastKeys.length,
        dbVideos: videos.length,
        dbPodcasts: podcasts.length,
        videosWithMissingS3Key: videos.filter(v => !v.existsInS3).length,
        podcastsWithMissingS3Key: podcasts.filter(p => !p.existsInS3).length,
      },
    });
  } catch (err) {
    console.error("[Diagnose]", err);
    res.status(500).json({ error: "Diagnose failed", detail: (err as Error).message });
  }
});

export default router;
