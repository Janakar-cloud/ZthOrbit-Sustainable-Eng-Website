import { Schema, model } from "mongoose";

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface IAppLog {
  level: LogLevel;
  message: string;
  source?: string;          // e.g. "auth", "media", "engage"
  meta?: Record<string, unknown>;
  userId?: string;
  ip?: string;
  createdAt?: Date;
}

const appLogSchema = new Schema<IAppLog>(
  {
    level: { type: String, enum: ["info", "warn", "error", "debug"], required: true },
    message: { type: String, required: true },
    source: { type: String },
    meta: { type: Schema.Types.Mixed },
    userId: { type: String },
    ip: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL: auto-delete logs older than 90 days
appLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
appLogSchema.index({ level: 1 });
appLogSchema.index({ source: 1 });

export const AppLog = model<IAppLog>("AppLog", appLogSchema);
