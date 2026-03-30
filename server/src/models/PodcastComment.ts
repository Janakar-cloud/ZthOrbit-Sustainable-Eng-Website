import { Schema, model, Types } from "mongoose";

export interface IPodcastComment {
  podcastId: Types.ObjectId;
  author: string;
  message: string;
  status: "visible" | "hidden";
  parentCommentId?: Types.ObjectId;
  createdAt: Date;
}

const podcastCommentSchema = new Schema<IPodcastComment>(
  {
    podcastId: { type: Schema.Types.ObjectId, ref: "Podcast", required: true },
    author: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["visible", "hidden"], default: "visible" },
    parentCommentId: { type: Schema.Types.ObjectId, ref: "PodcastComment" },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

export const PodcastComment = model<IPodcastComment>("PodcastComment", podcastCommentSchema);
