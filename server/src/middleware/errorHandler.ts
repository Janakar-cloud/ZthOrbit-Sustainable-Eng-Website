import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
    return res.status(409).json({
      error: field === "normalizedTitle"
        ? "A video, podcast, or article with the same title already exists"
        : `Duplicate value for ${field}`,
    });
  }
  const status = err.status || 500;
  // Never leak internal error details in production for 5xx responses
  const message =
    status < 500 || process.env.NODE_ENV !== "production"
      ? err.message || "Unexpected error"
      : "An unexpected error occurred. Please try again later.";
  res.status(status).json({ error: message });
}
