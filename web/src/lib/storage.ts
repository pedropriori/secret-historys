import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("🔧 [STORAGE] Configurando cliente Supabase admin...");
    console.log("🔧 [STORAGE] Supabase URL:", supabaseUrl ? "✅ configurado" : "❌ não configurado");
    console.log("🔧 [STORAGE] Service Key:", supabaseServiceKey ? "✅ configurado" : "❌ não configurado");
    console.log("🔧 [STORAGE] Service Key preview:", supabaseServiceKey?.substring(0, 20) + "...");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("❌ [STORAGE] Supabase admin credentials not found. Skipping client creation.");
      return null;
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ [STORAGE] Cliente Supabase admin criado");
  }

  return supabaseAdminInstance;
}

export const supabaseAdmin = getSupabaseAdmin();

export async function uploadCoverFromBuffer(
  slug: string,
  buf: Buffer,
  mime: string = "image/jpeg",
) {
  console.log("📤 [STORAGE] Iniciando upload da capa...");
  console.log("📤 [STORAGE] Slug:", slug);
  console.log("📤 [STORAGE] Buffer size:", buf.length, "bytes");
  console.log("📤 [STORAGE] MIME type:", mime);

  const admin = getSupabaseAdmin();

  if (!admin) {
    throw new Error("Supabase admin client not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  const bucket = process.env.SUPABASE_COVERS_BUCKET || "covers";
  const ext = mime.includes("png") ? "png" : "jpg";
  const path = `covers/${slug}.${ext}`;

  console.log("📤 [STORAGE] Bucket:", bucket);
  console.log("📤 [STORAGE] Path:", path);

  try {
    const { error } = await admin.storage
      .from(bucket)
      .upload(path, buf, { upsert: true, contentType: mime });

    if (error) {
      console.error("❌ [STORAGE] Erro no upload:", error);
      throw error;
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(path);
    console.log("✅ [STORAGE] Capa enviada com sucesso:", data.publicUrl);
    return data.publicUrl;
  } catch (err) {
    console.error("❌ [STORAGE] Erro no upload da capa:", err);
    throw err;
  }
}

export default uploadCoverFromBuffer;


export async function uploadPdfToStorage(
  slug: string,
  buf: Buffer,
  mime: string = "application/pdf",
) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    throw new Error("Supabase admin client not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }

  const bucket = process.env.SUPABASE_PDFS_BUCKET || "pdfs";
  const path = `pdfs/${slug}.pdf`;
  const { error } = await admin.storage
    .from(bucket)
    .upload(path, buf, { upsert: true, contentType: mime });
  if (error) throw error;
  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}


