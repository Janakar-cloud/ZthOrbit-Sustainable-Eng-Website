import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
  userId: string;
  title: string;
  description: string;
  avatarUrl?: string;
  type: string;
  postedAt: Date;
  isUnread: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  avatarUrl: { type: String },
  type: { type: String, required: true },
  postedAt: { type: Date, default: () => new Date() },
  isUnread: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() },
});

notificationSchema.index({ userId: 1, isUnread: 1 });
notificationSchema.index({ userId: 1, postedAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
