import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";

const BUCKET = "event-images";

// Uploads an event image to Supabase Storage and returns its public URL.
export async function uploadEventImage(
  file: Express.Multer.File,
): Promise<string> {
  const ext = file.originalname.includes(".")
    ? `.${file.originalname.split(".").pop()}`
    : "";
  const key = `${Date.now()}-${randomUUID()}${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, file.buffer, { contentType: file.mimetype });
  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
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
