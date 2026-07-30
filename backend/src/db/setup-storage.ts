import "dotenv/config";
import postgres from "postgres";

// Menyiapkan bucket Supabase Storage "torano" (publik) + policy agar user yang
// login bisa mengunggah gambar. Dijalankan sekali: npm run db:setup-storage
async function main(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    console.error("DATABASE_URL wajib diisi");
    process.exit(1);
  }
  const sql = postgres(databaseUrl, { prepare: false });

  // Bucket publik, batas 5MB, hanya gambar.
  await sql`
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('torano', 'torano', true, 5242880,
            array['image/png','image/jpeg','image/jpg','image/webp']::text[])
    on conflict (id) do update
      set public = true,
          file_size_limit = 5242880,
          allowed_mime_types = excluded.allowed_mime_types`;
  console.log("Bucket 'torano' siap (publik, maks 5MB, gambar).");

  // Policy pada storage.objects untuk bucket ini.
  const policies: Array<[string, string]> = [
    ["torano_read", `create policy "torano_read" on storage.objects for select using (bucket_id = 'torano')`],
    ["torano_insert", `create policy "torano_insert" on storage.objects for insert to authenticated with check (bucket_id = 'torano')`],
    ["torano_update", `create policy "torano_update" on storage.objects for update to authenticated using (bucket_id = 'torano')`],
    ["torano_delete", `create policy "torano_delete" on storage.objects for delete to authenticated using (bucket_id = 'torano')`],
  ];
  for (const [name, ddl] of policies) {
    await sql.unsafe(`drop policy if exists "${name}" on storage.objects`);
    await sql.unsafe(ddl);
    console.log(`  policy ${name} dibuat`);
  }

  console.log("Selesai.");
  await sql.end();
}

main().catch((err) => {
  console.error("Gagal:", err.message ?? err);
  process.exit(1);
});
