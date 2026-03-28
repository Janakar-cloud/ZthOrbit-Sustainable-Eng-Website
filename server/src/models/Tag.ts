import { Schema, model } from "mongoose";

export interface ITag {
  name: string;
  kind: "category" | "topic" | "role";
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["category", "topic", "role"], default: "category" },
  },
  { timestamps: false }
);

export const Tag = model<ITag>("Tag", tagSchema);
