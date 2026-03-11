import { Schema, model, Types } from "mongoose";

export interface IPodcast {
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: string;
  publishDate?: Date;
  status: "draft" | "published";
  tags: Types.ObjectId[];
}

const podcastSchema = new Schema<IPodcast>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    audioUrl: { type: String, required: true },
    imageUrl: { type: String },
    duration: { type: String },
    publishDate: { type: Date },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

export const Podcast = model<IPodcast>("Podcast", podcastSchema);
