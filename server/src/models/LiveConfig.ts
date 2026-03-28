import { Schema, model } from "mongoose";

export interface ILiveConfig {
  streamUrl: string;
  title: string;
  description: string;
  updatedBy?: string;
  updatedAt: Date;
}

const liveConfigSchema = new Schema<ILiveConfig>(
  {
    streamUrl: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    updatedBy: { type: String },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

export const LiveConfig = model<ILiveConfig>("LiveConfig", liveConfigSchema);
