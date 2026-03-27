import { Router } from "express";
import { z } from "zod";
import { LiveConfig } from "../models/LiveConfig.js";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { createCloudFrontSignedCookies } from "../utils/cloudfront.js";

const router = Router();

router.get("/config", async (_req, res) => {
  const config = await LiveConfig.findOne();
  if (!config) return res.json({ streamUrl: "", title: "", description: "" });
  res.json(config);
});

router.post("/access", requireAuth(), async (req, res) => {
  const config = await LiveConfig.findOne();
  if (!config?.streamUrl) {
    return res.status(404).json({ error: "Live stream not configured" });
  }

  if (!env.cloudFront.keyPairId || !env.cloudFront.privateKey) {
    return res.status(500).json({ error: "CloudFront cookie signing is not configured" });
  }

  let streamUrl: URL;
  try {
    streamUrl = new URL(config.streamUrl);
  } catch {
    return res.status(500).json({ error: "Configured stream URL is invalid" });
  }

  if (env.cloudFront.streamDomain && streamUrl.hostname !== env.cloudFront.streamDomain) {
    return res.status(500).json({ error: "Configured stream URL hostname does not match CF_STREAM_DOMAIN" });
  }

  const wildcardPath = `${streamUrl.pathname.replace(/\/[^/]*$/, "") || "/"}*`;
  const resourceUrl = `${streamUrl.protocol}//${streamUrl.host}${wildcardPath}`;
  const expiresAtUnix = Math.floor(Date.now() / 1000) + env.cloudFront.cookieTtlSeconds;

  const cookies = createCloudFrontSignedCookies({
    keyPairId: env.cloudFront.keyPairId,
    privateKeyPem: env.cloudFront.privateKey,
    resourceUrl,
    expiresAtUnix,
  });

  const cookiePath = streamUrl.pathname.replace(/\/[^/]*$/, "/") || "/";
  const isProd = env.nodeEnv === "production";

  let cookieDomain = env.cloudFront.cookieDomain;
  if (!cookieDomain && isProd) {
    try {
      const appHost = new URL(env.appUrl).hostname.replace(/^www\./, "");
      cookieDomain = `.${appHost}`;
    } catch {
      cookieDomain = "";
    }
  }

  for (const [name, value] of Object.entries(cookies)) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: env.cloudFront.cookieTtlSeconds * 1000,
      domain: cookieDomain || undefined,
      path: cookiePath,
    });
  }

  return res.json({
    streamUrl: config.streamUrl,
    title: config.title,
    description: config.description,
    expiresIn: env.cloudFront.cookieTtlSeconds,
  });
});

const liveSchema = z.object({
  streamUrl: z.string().url(),
  title: z.string().min(1),
  description: z.string().optional().default(""),
});

router.put("/config", requireAuth(["superadmin", "admin", "editor"]), async (req, res) => {
  const parsed = liveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;
  const config = await LiveConfig.findOneAndUpdate(
    {},
    { ...data, updatedBy: req.user?.email, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  res.json(config);
});

export default router;
