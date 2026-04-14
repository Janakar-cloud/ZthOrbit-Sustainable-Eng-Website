import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongoUri, {
    // autoIndex disabled in production for performance — indexes are created
    // explicitly by ensureMediaUniqueIndexes() called at startup in index.ts
    autoIndex: env.nodeEnv !== "production",
  });
  console.log("[db] connected");

  // In production, trigger index sync once after connection so new indexes
  // defined in schemas are applied without needing a separate migration step.
  if (env.nodeEnv === "production") {
    mongoose.connection.once("open", async () => {
      try {
        await mongoose.connection.syncIndexes();
        console.log("[db] indexes synced");
      } catch (err: any) {
        console.error("[db] index sync failed:", err.message);
      }
    });
  }
}
