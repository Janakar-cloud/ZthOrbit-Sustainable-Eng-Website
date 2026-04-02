import { Schema, model, Types } from "mongoose";
import { normalizeMediaTitle } from "../utils/mediaTitle.js";

export interface IArticle {
  title: string;
  normalizedTitle?: string;
  subtitle?: string;
  bodyMd: string;
  readTime?: string;
  coverImage?: string;
  publishDate?: Date;
  status: "draft" | "published";
  featured: boolean;
  tags: Types.ObjectId[];
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
    readTime: { type: String },
    coverImage: { type: String },
    publishDate: { type: Date },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    featured: { type: Boolean, default: false },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

articleSchema.index(
  { normalizedTitle: 1 },
  { unique: true, partialFilterExpression: { normalizedTitle: { $type: "string" } } }
);

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
