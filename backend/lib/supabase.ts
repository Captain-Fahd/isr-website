import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
      "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) must be set",
  );
}
export const supabase = createClient(supabaseUrl, supabaseKey);

// Service-role client for server-side Storage uploads (bypasses bucket RLS).
// Only used on checkAuth-protected routes. Falls back to the anon client if
// the secret key is not configured.
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
export const supabaseAdmin = supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey)
  : supabase;
