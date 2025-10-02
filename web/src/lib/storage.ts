import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Supabase admin credentials not found. Skipping client creation.");
      return null;
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey);
  }

  return supabaseAdminInstance;
}

export const supabaseAdmin = getSupabaseAdmin();

export async function uploadCoverFromBuffer(
  slug: string,
  buf: Buffer,
  mime: string = "image/jpeg",
) {
  const admin = getSupabaseAdmin();

  if (!admin) {
    throw new Error("Supabase admin client not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  const bucket = process.env.SUPABASE_COVERS_BUCKET || "covers";
  const ext = mime.includes("png") ? "png" : "jpg";
  const path = `covers/${slug}.${ext}`;
  const { error } = await admin.storage
    .from(bucket)
    .upload(path, buf, { upsert: true, contentType: mime });
  if (error) throw error;
  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export default uploadCoverFromBuffer;


