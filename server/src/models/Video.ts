import { Schema, model, Types } from "mongoose";

export interface IVideo {
  title: string;
  description: string;
  streamUrl: string;
  thumbnailUrl: string;
  duration?: string;
  publishDate?: Date;
  status: "draft" | "published";
  isLive: boolean;
  tags: Types.ObjectId[];
  metadata?: Record<string, any>;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    streamUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    duration: { type: String },
    publishDate: { type: Date },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    isLive: { type: Boolean, default: false },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Video = model<IVideo>("Video", videoSchema);
