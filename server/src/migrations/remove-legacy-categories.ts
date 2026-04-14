import { connectDb } from "../config/db.js";
import { Tag } from "../models/Tag.js";
import { Video } from "../models/Video.js";
import { Podcast } from "../models/Podcast.js";
import { Article } from "../models/Article.js";

/**
 * Migration: remove legacy category tags (AETHER, AQUA, CIVITAS, MATERIA, TERRA)
 * from the Tags collection and strip their ObjectId references from all
 * Video, Podcast, and Article documents.
 *
 * Run once on the server:
 *   npx tsx src/migrations/remove-legacy-categories.ts
 */

const LEGACY_NAMES = ["AETHER", "AQUA", "CIVITAS", "MATERIA", "TERRA"];

async function main() {
  await connectDb();

  // 1. Find the Tag documents to delete
  const tags = await Tag.find({ name: { $in: LEGACY_NAMES } });
  if (tags.length === 0) {
    console.log("No legacy category tags found — nothing to do.");
    process.exit(0);
  }

  const tagIds = tags.map((t) => t._id);
  console.log(`Found ${tags.length} legacy tags: ${tags.map((t) => t.name).join(", ")}`);

  // 2. Pull their IDs out of every media document's tags array
  const [vRes, pRes, aRes] = await Promise.all([
    Video.updateMany({ tags: { $in: tagIds } }, { $pull: { tags: { $in: tagIds } } }),
    Podcast.updateMany({ tags: { $in: tagIds } }, { $pull: { tags: { $in: tagIds } } }),
    Article.updateMany({ tags: { $in: tagIds } }, { $pull: { tags: { $in: tagIds } } }),
  ]);

  console.log(`Videos updated:   ${vRes.modifiedCount}`);
  console.log(`Podcasts updated: ${pRes.modifiedCount}`);
  console.log(`Articles updated: ${aRes.modifiedCount}`);

  // 3. Delete the Tag documents
  const delRes = await Tag.deleteMany({ _id: { $in: tagIds } });
  console.log(`Tags deleted: ${delRes.deletedCount}`);

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
