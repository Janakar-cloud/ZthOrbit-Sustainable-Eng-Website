import { Schema, model, Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  description: string;
  coverUrl: string;
  totalViews: number;
  totalComments: number;
  totalShares: number;
  totalFavorites: number;
  postedAt: Date;
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    coverUrl: { type: String, required: true },
    totalViews: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalShares: { type: Number, default: 0 },
    totalFavorites: { type: Number, default: 0 },
    postedAt: { type: Date, default: () => new Date() },
    author: {
      name: { type: String, required: true },
      avatarUrl: { type: String },
    },
  },
  { timestamps: true }
);

postSchema.index({ postedAt: -1 });
postSchema.index({ totalViews: -1 });

export const Post = model<IPost>("Post", postSchema);
