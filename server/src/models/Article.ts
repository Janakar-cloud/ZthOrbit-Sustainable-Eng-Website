import { Schema, model, Types } from "mongoose";

export interface IArticle {
  title: string;
  subtitle?: string;
  bodyMd: string;
  readTime?: string;
  coverImage?: string;
  publishDate?: Date;
  status: "draft" | "published";
  featured: boolean;
  tags: Types.ObjectId[];
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
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

export const Article = model<IArticle>("Article", articleSchema);
