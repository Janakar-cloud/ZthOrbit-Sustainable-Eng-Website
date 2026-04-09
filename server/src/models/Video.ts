import { Schema, model, Types } from "mongoose";
import { normalizeMediaTitle } from "../utils/mediaTitle.js";

export interface IVideo {
  title: string;
  normalizedTitle?: string;
  description: string;
  streamUrl: string;
  thumbnailUrl: string;
  duration?: string;
  publishDate?: Date;
  status: "draft" | "published";
  isLive: boolean;
  tags: Types.ObjectId[];
  seriesId?: string;
  partNumber?: number;
  partTitle?: string;
  metadata?: Record<string, any>;
  views: number;
  likes: number;
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

function applyNormalizedTitleToUpdate(update: any) {
  const nextTitle = update?.$set?.title ?? update?.title;
  if (typeof nextTitle !== "string") return;
  const normalizedTitle = normalizeMediaTitle(nextTitle);
  update.$set = { ...(update.$set ?? {}), normalizedTitle };
  if ("normalizedTitle" in update) delete update.normalizedTitle;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true, trim: true },
    normalizedTitle: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    streamUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    duration: { type: String },
    publishDate: { type: Date },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    isLive: { type: Boolean, default: false },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    seriesId: { type: String },
    partNumber: { type: Number },
    partTitle: { type: String },
    metadata: { type: Schema.Types.Mixed },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

videoSchema.index(
  { normalizedTitle: 1 },
  { unique: true, partialFilterExpression: { normalizedTitle: { $type: "string" } } }
);
videoSchema.index({ status: 1, publishDate: -1 });

videoSchema.pre("validate", function (next) {
  if (this.title) {
    this.normalizedTitle = normalizeMediaTitle(this.title);
  }
  next();
});

videoSchema.pre("findOneAndUpdate", function (next) {
  applyNormalizedTitleToUpdate(this.getUpdate());
  next();
});

videoSchema.pre("updateOne", function (next) {
  applyNormalizedTitleToUpdate(this.getUpdate());
  next();
});

export const Video = model<IVideo>("Video", videoSchema);
