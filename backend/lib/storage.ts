import { randomUUID } from "crypto";
import sharp from "sharp";
import { supabaseAdmin } from "./supabase";

const BUCKET = "event-images";
const ANNOUNCEMENT_BUCKET = "announcement-images";
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
