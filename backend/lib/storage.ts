import { randomUUID } from "crypto";
import sharp from "sharp";
import { supabaseAdmin } from "./supabase";

const BUCKET = "event-images";
const ANNOUNCEMENT_BUCKET = "announcement-images";
const FLAGSHIP_BUCKET = "flagship-images";
/** One year — filenames are unique hashes, so long caching is safe. */
const CACHE_CONTROL = "31536000";
const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1600;
const WEBP_QUALITY = 80;

async function optimiseImage(file: Express.Multer.File): Promise<{
  buffer: Buffer;
  contentType: string;
  extension: string;
}> {
  const buffer = await sharp(file.buffer)
    .rotate()
    .resize({
      width: MAX_IMAGE_WIDTH,
      height: MAX_IMAGE_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return {
    buffer,
    contentType: "image/webp",
    extension: ".webp",
  };
}

async function uploadOptimisedImage(
  bucket: string,
  file: Express.Multer.File,
): Promise<string> {
  const optimised = await optimiseImage(file);
  const key = `${Date.now()}-${randomUUID()}${optimised.extension}`;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(key, optimised.buffer, {
      contentType: optimised.contentType,
      cacheControl: CACHE_CONTROL,
    });
  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(key);
  return data.publicUrl;
}

// Uploads an event image to Supabase Storage and returns its public URL.
export async function uploadEventImage(
  file: Express.Multer.File,
): Promise<string> {
  return uploadOptimisedImage(BUCKET, file);
}

// Best-effort removal of a stored image; never throws so it can't block a DB delete.
export async function deleteEventImage(imageUrl: string): Promise<void> {
  try {
    const marker = `/${BUCKET}/`;
    const idx = imageUrl.indexOf(marker);
    if (idx === -1) return;
    const key = imageUrl.slice(idx + marker.length);
    await supabaseAdmin.storage.from(BUCKET).remove([key]);
  } catch (err) {
    console.error("Failed to delete event image:", err);
  }
}

export async function uploadAnnouncementImage(
  file: Express.Multer.File,
): Promise<string> {
  return uploadOptimisedImage(ANNOUNCEMENT_BUCKET, file);
}

export async function deleteAnnouncementImage(imageUrl: string): Promise<void> {
  try {
    const marker = `/${ANNOUNCEMENT_BUCKET}/`;
    const idx = imageUrl.indexOf(marker);
    if (idx === -1) return;
    const key = imageUrl.slice(idx + marker.length);
    await supabaseAdmin.storage.from(ANNOUNCEMENT_BUCKET).remove([key]);
  } catch (err) {
    console.error("Failed to delete announcement image:", err);
  }
}

export async function uploadFlagshipImage(
  file: Express.Multer.File,
): Promise<string> {
  return uploadOptimisedImage(FLAGSHIP_BUCKET, file);
}

async function deleteFlagshipImageByUrl(imageUrl: string): Promise<void> {
  const marker = `/${FLAGSHIP_BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return;
  const key = imageUrl.slice(idx + marker.length);
  await supabaseAdmin.storage.from(FLAGSHIP_BUCKET).remove([key]);
}

export async function deleteFlagshipImage(imageUrl: string): Promise<void> {
  try {
    await deleteFlagshipImageByUrl(imageUrl);
  } catch (err) {
    console.error("Failed to delete flagship image:", err);
  }
}

// A flagship event has many image fields, unlike every other resource (one `imageUrl`
// each) — walk every slot that can hold one and return the ones actually stored in
// the flagship-images bucket, so update/delete can diff and clean up stale images.
// The Prisma model stores these as untyped JSON, so field access is defensive.
type FlagshipImageFields = {
  banner?: unknown;
  ogImage?: unknown;
  theme?: unknown;
  venue?: unknown;
  speakers?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function collectFlagshipImageUrls(event: FlagshipImageFields): string[] {
  const banner = asRecord(event.banner);
  const theme = asRecord(event.theme);
  const hero = asRecord(theme.hero);
  const venue = asRecord(event.venue);
  const venueImage = asRecord(venue.image);
  const speakers = Array.isArray(event.speakers) ? event.speakers : [];

  const candidates = [
    asString(banner.src),
    asString(asRecord(banner.mobile).src),
    asString(event.ogImage),
    asString(hero.backdrop),
    asString(hero.backdropMobile),
    asString(venueImage.src),
    ...speakers.map((speaker) => asString(asRecord(speaker).image)),
  ];

  const marker = `/${FLAGSHIP_BUCKET}/`;
  return candidates.filter((url): url is string => url !== undefined && url.includes(marker));
}

// Best-effort removal of every image a flagship event referenced; never throws so it
// can't block a DB delete/update.
export async function deleteFlagshipImages(urls: string[]): Promise<void> {
  try {
    await Promise.all(urls.map((url) => deleteFlagshipImageByUrl(url)));
  } catch (err) {
    console.error("Failed to delete flagship image(s):", err);
  }
}
