import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Durante o build, pode não haver variáveis de ambiente
    // Retornar null é seguro pois o código deve lidar com isso
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials not found. Skipping client creation.");
      return null;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseInstance;
}

// Exportar compatibilidade com código existente
export const supabase = getSupabaseClient();
export default supabase;



