import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests. Please slow down and try again later.",
    });
  },
});
