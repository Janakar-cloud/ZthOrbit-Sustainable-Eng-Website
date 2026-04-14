import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const candidateEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(currentDir, "../../.env"),
  path.resolve(currentDir, "../../../.env"),
];
const envPath = candidateEnvPaths.find((candidate) => existsSync(candidate));

dotenv.config(envPath ? { path: envPath } : undefined);

const required = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "S3_REGION",
  "S3_BUCKET",
  // S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY are optional — EC2 uses IAM role
];

for (const key of required) {
  if (!process.env[key]) {
    // Soft fail during build; runtime will throw if missing
    console.warn(`[env] Missing env var ${key}`);
  }
}

// In production CORS_ORIGINS must be explicit — wildcard is not safe
if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGINS) {
  console.warn("[env] CORS_ORIGINS not set in production — defaulting to restrictive empty list. Set CORS_ORIGINS to allow frontend access.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/zthorbit",
  jwtSecret: process.env.JWT_SECRET || "changeme",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "changeme-refresh",
  appUrl: process.env.APP_URL || "http://localhost:5173",
  dashboardUrl: process.env.DASHBOARD_URL || "http://localhost:3039",
  corsOrigins: (process.env.CORS_ORIGINS || (process.env.NODE_ENV === "production" ? "" : "*"))
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 200),
  },
  s3: {
    region: process.env.S3_REGION || "us-east-1",
    bucket: process.env.S3_BUCKET || "",
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 465),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true,
  },
  live: {
    accessMode: (() => {
      const mode = (process.env.LIVE_ACCESS_MODE || "direct").toLowerCase();
      if (mode === "cloudfront") return "cloudfront";
      if (mode === "s3_playlist") return "s3_playlist";
      return "direct";
    })(),
    s3Folder: process.env.LIVE_S3_FOLDER || "LiveTV",
  },
  cloudFront: {
    streamDomain: process.env.CF_STREAM_DOMAIN || "",
    keyPairId: process.env.CF_KEY_PAIR_ID || "",
    privateKey: (process.env.CF_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    cookieTtlSeconds: Number(process.env.CF_COOKIE_TTL_SECONDS || 600),
    cookieDomain: process.env.CF_COOKIE_DOMAIN || "",
  },
  envPath: envPath || "",
  // S3 → DB auto-sync interval in ms. Default: 15 minutes. Set to 0 to disable.
  syncIntervalMs: Number(process.env.SYNC_INTERVAL_MS ?? 5 * 60 * 1000),
};

// Guard: reject weak placeholder secrets in production to prevent auth exploits
if (env.nodeEnv === "production") {
  if (env.jwtSecret === "changeme" || env.jwtSecret.length < 32) {
    throw new Error("[env] JWT_SECRET is missing or insecure. Set a strong secret (≥32 chars) in production.");
  }
  if (env.jwtRefreshSecret === "changeme-refresh" || env.jwtRefreshSecret.length < 32) {
    throw new Error("[env] JWT_REFRESH_SECRET is missing or insecure. Set a strong secret (≥32 chars) in production.");
  }
}
