import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production",
  });
  console.log("[db] connected");
}
