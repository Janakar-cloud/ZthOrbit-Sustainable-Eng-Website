import { Schema, model } from "mongoose";

export interface IUser {
  email: string;
  passwordHash: string;
  role: "superadmin" | "admin" | "editor" | "viewer";
  name?: string;
  avatarUrl?: string;
  socials?: Record<string, string>;
  status: "active" | "inactive";
  emailVerified?: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 320 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["superadmin", "admin", "editor", "viewer"], default: "viewer" },
    name: { type: String, trim: true, maxlength: 100 },
    avatarUrl: { type: String },
    socials: { type: Schema.Types.Mixed },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    emailVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

export const User = model<IUser>("User", userSchema);
