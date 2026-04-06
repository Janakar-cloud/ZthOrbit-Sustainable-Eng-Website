import type { Request } from "express";
import { AppLog, type LogLevel } from "../models/AppLog.js";

interface LogOptions {
  source?: string;
  meta?: Record<string, unknown>;
  req?: Request;
}

async function write(level: LogLevel, message: string, opts: LogOptions = {}) {
  const entry: Record<string, unknown> = { level, message };
  if (opts.source) entry.source = opts.source;
  if (opts.meta) entry.meta = opts.meta;
  if (opts.req) {
    const req = opts.req as any;
    entry.userId = req.user?.id ?? req.user?._id ?? undefined;
    entry.ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip;
  }

  // Fire-and-forget DB write — never let logging block the request
  AppLog.create(entry).catch((err) => {
    console.error("[logger] DB write failed:", err?.message);
  });

  // Also write to stdout so PM2/CloudWatch picks it up
  const prefix = `[${level.toUpperCase()}]${opts.source ? `[${opts.source}]` : ""}`;
  if (level === "error") {
    console.error(prefix, message, opts.meta ?? "");
  } else if (level === "warn") {
    console.warn(prefix, message, opts.meta ?? "");
  } else {
    console.log(prefix, message, opts.meta ?? "");
  }
}

export const logger = {
  info:  (message: string, opts?: LogOptions) => write("info",  message, opts),
  warn:  (message: string, opts?: LogOptions) => write("warn",  message, opts),
  error: (message: string, opts?: LogOptions) => write("error", message, opts),
  debug: (message: string, opts?: LogOptions) => write("debug", message, opts),
};
