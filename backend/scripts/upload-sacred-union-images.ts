/**
 * One-off migration helper.
 *
 * Uploads The Sacred Union's existing images (currently served from
 * frontend/public/images/sacred-union/) into the new "flagship-images" Supabase
 * Storage bucket, so the backfill INSERT in
 * prisma/migrations/20261030000000_add_flagship_events/migration.sql can point at
 * real Storage URLs instead of static-export paths.
 *
 * These files are already sized/optimised for the web, so they're uploaded as-is —
 * no `sharp` re-processing (unlike admin-uploaded images going forward, see
 * lib/storage.ts's uploadFlagshipImage).
 *
 * `banner-mobile.jpg` is not uploaded: sacred-union.ts never sets `banner.mobile`,
 * so it's unreferenced dead weight already.
 *
 * Usage:
 *   npx tsx scripts/upload-sacred-union-images.ts            # dry run, prints the plan
 *   npx tsx scripts/upload-sacred-union-images.ts --commit    # actually uploads
 *
 * Safe to delete once the migration.sql placeholders have been filled in and applied.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { supabaseAdmin } from "../lib/supabase";

const BUCKET = "flagship-images";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(scriptDir, "..", "..", "frontend", "public", "images", "sacred-union");

const FILES: { file: string; key: string; contentType: string; placeholder: string }[] = [
  { file: "backdrop.webp", key: "sacred-union/backdrop.webp", contentType: "image/webp", placeholder: "__BACKDROP_URL__" },
  { file: "backdrop-mobile.webp", key: "sacred-union/backdrop-mobile.webp", contentType: "image/webp", placeholder: "__BACKDROP_MOBILE_URL__" },
  { file: "save-the-date.webp", key: "sacred-union/banner.webp", contentType: "image/webp", placeholder: "__BANNER_URL__" },
  { file: "venue-storey-hall.webp", key: "sacred-union/venue.webp", contentType: "image/webp", placeholder: "__VENUE_IMAGE_URL__" },
  { file: "og-placeholder.png", key: "sacred-union/og-image.png", contentType: "image/png", placeholder: "__OG_IMAGE_URL__" },
];

async function main() {
  const commit = process.argv.includes("--commit");

  const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  if (bucketError && !/already exists/i.test(bucketError.message)) {
    console.error(`Could not ensure bucket "${BUCKET}" exists:`, bucketError.message);
    console.error('If it already exists under a different name/policy, create it manually in the Supabase dashboard first.');
  }

  console.log(commit ? "Uploading…" : "Dry run — pass --commit to actually upload.\n");

  for (const { file, key, contentType, placeholder } of FILES) {
    const filePath = path.join(imagesDir, file);
    const buffer = readFileSync(filePath);

    if (!commit) {
      console.log(`Would upload ${filePath} -> ${BUCKET}/${key} (replaces ${placeholder})`);
      continue;
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET).upload(key, buffer, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) {
      throw new Error(`Failed to upload ${key}: ${error.message}`);
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key);
    console.log(`${placeholder} -> ${data.publicUrl}`);
  }

  if (!commit) {
    console.log("\nRe-run with --commit to upload and print the real URLs.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
