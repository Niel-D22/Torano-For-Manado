import { createClient } from "@supabase/supabase-js";

// Klien Supabase sisi browser. Menyimpan sesi & memproses redirect OAuth
// (Google) secara otomatis.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
