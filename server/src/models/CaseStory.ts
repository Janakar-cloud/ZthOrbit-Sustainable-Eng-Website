import { Schema, model, Types } from "mongoose";

interface Metric {
  label: string;
  value: string;
}

export interface ICaseStory {
  title: string;
  impact: string;
  duration?: string;
  heroImage?: string;
  metrics?: Metric[];
  bodyMd?: string;
  tags: Types.ObjectId[];
}

const caseStorySchema = new Schema<ICaseStory>(
  {
    title: { type: String, required: true },
    impact: { type: String, default: "" },
    duration: { type: String },
    heroImage: { type: String },
    metrics: [{ label: String, value: String }],
    bodyMd: { type: String },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

export const CaseStory = model<ICaseStory>("CaseStory", caseStorySchema);
