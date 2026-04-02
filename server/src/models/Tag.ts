import { Schema, model } from "mongoose";

export interface ITag {
  name: string;
  kind: "category" | "topic" | "role";
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      set: (value: string) => value.replace(/\s+/g, " ").trim(),
    },
    kind: { type: String, enum: ["category", "topic", "role"], default: "category" },
  },
  { timestamps: false }
);

export const Tag = model<ITag>("Tag", tagSchema);
