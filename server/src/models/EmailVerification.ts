import { Schema, model, Types } from "mongoose";

export interface IEmailVerification {
  userId: Types.ObjectId;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
});

emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerification = model<IEmailVerification>("EmailVerification", emailVerificationSchema);