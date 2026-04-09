import { Schema, model, Types } from "mongoose";
import { normalizeMediaTitle } from "../utils/mediaTitle.js";

export interface IArticle {
  title: string;
  normalizedTitle?: string;
  subtitle?: string;
  bodyMd: string;
  bodyHtml?: string;
  readTime?: string;
  coverImage?: string;
  publishDate?: Date;
  status: "draft" | "published";
  featured: boolean;
  tags: Types.ObjectId[];
  views: number;
  likes: number;
  commentsCount: number;
}

function applyNormalizedTitleToUpdate(update: any) {
  const nextTitle = update?.$set?.title ?? update?.title;
  if (typeof nextTitle !== "string") return;
  const normalizedTitle = normalizeMediaTitle(nextTitle);
  update.$set = { ...(update.$set ?? {}), normalizedTitle };
  if ("normalizedTitle" in update) delete update.normalizedTitle;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    normalizedTitle: { type: String, required: true, trim: true },
    subtitle: { type: String },
    bodyMd: { type: String, default: "" },
    bodyHtml: { type: String },
    readTime: { type: String },
    coverImage: { type: String },
    publishDate: { type: Date },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    featured: { type: Boolean, default: false },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

articleSchema.index(
  { normalizedTitle: 1 },
  { unique: true, partialFilterExpression: { normalizedTitle: { $type: "string" } } }
);
articleSchema.index({ status: 1, publishDate: -1 });

articleSchema.pre("validate", function (next) {
  if (this.title) {
    this.normalizedTitle = normalizeMediaTitle(this.title);
  }
  next();
});

articleSchema.pre("findOneAndUpdate", function (next) {
  applyNormalizedTitleToUpdate(this.getUpdate());
  next();
});

articleSchema.pre("updateOne", function (next) {
  applyNormalizedTitleToUpdate(this.getUpdate());
  next();
});

export const Article = model<IArticle>("Article", articleSchema);
