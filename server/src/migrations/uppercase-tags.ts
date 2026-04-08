import { connectDb } from "../config/db.js";
import { Tag } from "../models/Tag.js";

/**
 * Migration: uppercase all category tag names in the DB.
 * Run once on the server: npx tsx src/migrations/uppercase-tags.ts
 */
async function main() {
  await connectDb();

  const tags = await Tag.find({ kind: "category" });
  console.log(`Found ${tags.length} category tags to update.`);

  let updated = 0;
  for (const tag of tags) {
    const upper = tag.name.trim().toUpperCase();
    if (tag.name !== upper) {
      tag.name = upper;
      await tag.save();
      updated++;
      console.log(`  Updated: "${tag.name}" → "${upper}"`);
    }
  }

  console.log(`Done. ${updated} tags updated.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
