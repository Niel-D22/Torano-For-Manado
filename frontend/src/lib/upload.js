import { supabase } from "./supabase";

// Unggah gambar ke Supabase Storage (bucket "torano") lalu kembalikan URL publik.
// Ringan, tanpa dependency tambahan, dan aman di production.
const BUCKET = "torano";
const MAX = 5 * 1024 * 1024;

export async function uploadImage(file, folder = "misc") {
  if (!file) throw new Error("Tidak ada file dipilih");
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
  if (file.size > MAX) throw new Error("Ukuran gambar maksimal 5MB");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${folder}/${Date.now()}-${rand}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
