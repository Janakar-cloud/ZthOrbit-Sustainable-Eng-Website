import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import { ensureMediaUniqueIndexes, syncS3ToDb } from "./utils/s3Sync.js";

async function main() {
  await connectDb();
  await ensureMediaUniqueIndexes();

  // Non-blocking S3 → DB sync on every startup
  const runSync = (label: string) =>
    syncS3ToDb()
      .then((r) =>
        console.log(
          `[S3 Sync] ${label} done in ${r.durationMs}ms — videos +${r.videos.added}/~${r.videos.updated}/-${r.removed.videos} | podcasts +${r.podcasts.added}/~${r.podcasts.updated}/-${r.removed.podcasts} | articles +${r.articles.added}/~${r.articles.updated}/-${r.removed.articles}`
        )
      )
      .catch((err) => console.error(`[S3 Sync] ${label} failed:`, err.message));

  runSync("startup");

  // Scheduled sync every SYNC_INTERVAL_MS (default 5 min). Set to 0 to disable.
  if (env.syncIntervalMs > 0) {
    setInterval(() => runSync("scheduled"), env.syncIntervalMs);
    console.log(`[S3 Sync] Scheduled every ${env.syncIntervalMs / 1000 / 60} min`);
  }

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet({
    // Allow the API to be consumed from Vite dev (different origin) while keeping other helmet defaults
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  
  // CORS debug logging (only in development)
  if (env.nodeEnv === "development") {
    app.use((req, res, next) => {
      if (req.headers.origin) {
        const isAllowed = env.corsOrigins.includes("*") || env.corsOrigins.includes(req.headers.origin);
        console.log(`[CORS] ${req.method} ${req.path} from ${req.headers.origin} - ${isAllowed ? "ALLOWED" : "BLOCKED"}`);
      }
      next();
    });
  }

  const devOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    // EC2-hosted dev/dashboard origins
    "http://13.205.72.30:5173",
    "https://13.205.72.30:5173",
    "http://13.205.72.30:3039",
    "https://13.205.72.30:3039",
    // Production dashboard subdomain — always allowed regardless of CORS_ORIGINS env var
    "https://dashboard.thegreentv.com",
    "http://dashboard.thegreentv.com",
    // Main public site
    "https://www.thegreentv.com",
    "http://www.thegreentv.com",
  ];
  const allowedOrigins = new Set([...env.corsOrigins, ...devOrigins]);

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow tools like curl / Postman

      // Allow any dev port between 3000-5200. In development mode this applies to
      // any host (e.g. EC2 public IP running Vite). In production, only localhost/127.x.
      try {
        const url = new URL(origin);
        const isLocalHost = ["localhost", "127.0.0.1"].includes(url.hostname);
        const port = Number(url.port || 80);
        if (port >= 3000 && port <= 5200 && (isLocalHost || env.nodeEnv === "development")) {
          return callback(null, origin);
        }
      } catch (_) {
        // fall through to explicit allowlist
      }

      if (allowedOrigins.has("*") || allowedOrigins.has(origin)) {
        return callback(null, origin);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use("/api/v1", apiLimiter, routes);

  app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
  app.get("/readyz", (_req, res) => res.json({ status: "ready", envPath: env.envPath || "unknown" }));

  app.use((req, res) => res.status(404).json({ error: `Not found: ${req.path}` }));
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`[server] listening on :${env.port}`);
    console.log(`[server] environment: ${env.nodeEnv}`);
    console.log(`[server] CORS origins: ${env.corsOrigins.join(", ")}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});