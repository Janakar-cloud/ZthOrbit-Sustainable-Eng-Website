import { Schema, model, Types } from "mongoose";
import { normalizeMediaTitle } from "../utils/mediaTitle.js";

export interface IPodcast {
  title: string;
  normalizedTitle?: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: string;
  publishDate?: Date;
  status: "draft" | "published";
  tags: Types.ObjectId[];
  views: number;
  likes: number;
  commentsCount: number;
  commentsEnabled: boolean;
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

const podcastSchema = new Schema<IPodcast>(
  {
    title: { type: String, required: true, trim: true },
    normalizedTitle: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    audioUrl: { type: String, required: true },
    imageUrl: { type: String },
    duration: { type: String },
    publishDate: { type: Date },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    commentsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

podcastSchema.index(
  { normalizedTitle: 1 },
  { unique: true, partialFilterExpression: { normalizedTitle: { $type: "string" } } }
);

podcastSchema.pre("validate", function (next) {
  if (this.title) {
    this.normalizedTitle = normalizeMediaTitle(this.title);
  }
  next();
});

podcastSchema.pre("findOneAndUpdate", function (next) {
  applyNormalizedTitleToUpdate(this.getUpdate());
  next();
});

podcastSchema.pre("updateOne", function (next) {
  applyNormalizedTitleToUpdate(this.getUpdate());
  next();
});

export const Podcast = model<IPodcast>("Podcast", podcastSchema);
