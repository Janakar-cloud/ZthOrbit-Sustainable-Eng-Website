import { Schema, model } from "mongoose";

export interface ITag {
  name: string;
  kind: "category" | "topic" | "role";
}

export function normalizeTagName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().toUpperCase();
}

export function normalizeTagKey(value: unknown): string {
  return normalizeTagName(value).toLowerCase();
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      set: normalizeTagName,
    },
    kind: { type: String, enum: ["category", "topic", "role"], default: "category" },
  },
  { timestamps: false }
);

export const Tag = model<ITag>("Tag", tagSchema);
