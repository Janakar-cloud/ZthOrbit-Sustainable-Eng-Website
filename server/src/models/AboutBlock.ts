import { Schema, model } from "mongoose";

export interface IAboutBlock {
  kind: "theme" | "timeline" | "gallery" | "cta";
  title: string;
  body?: string;
  mediaUrl?: string;
  order: number;
}

const aboutBlockSchema = new Schema<IAboutBlock>(
  {
    kind: { type: String, enum: ["theme", "timeline", "gallery", "cta"], required: true },
    title: { type: String, required: true },
    body: { type: String },
    mediaUrl: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AboutBlock = model<IAboutBlock>("AboutBlock", aboutBlockSchema);
