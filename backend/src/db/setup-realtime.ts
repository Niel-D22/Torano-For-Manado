import "dotenv/config";
import postgres from "postgres";

// Mengaktifkan Supabase Realtime untuk tabel messages: masuk ke publication
// realtime + replica identity, dan RLS agar hanya peserta percakapan yang
// menerima pesan. Dijalankan sekali: npm run db:setup-realtime
async function main(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    console.error("DATABASE_URL wajib diisi");
    process.exit(1);
  }
  const sql = postgres(databaseUrl, { prepare: false });

  await sql.unsafe(`alter table public.messages replica identity full`);

  // Tambahkan ke publication realtime bila belum ada.
  await sql.unsafe(`
    do $$
    begin
      if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
        if not exists (
          select 1 from pg_publication_tables
          where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
        ) then
          alter publication supabase_realtime add table public.messages;
        end if;
      end if;
    end $$;
  `);
  console.log("messages masuk publication realtime + replica identity full.");

  // RLS: peserta percakapan boleh membaca pesannya (dipakai realtime).
  await sql.unsafe(`alter table public.messages enable row level security`);
  await sql.unsafe(`drop policy if exists "messages_select_participant" on public.messages`);
  await sql.unsafe(`
    create policy "messages_select_participant" on public.messages
    for select using (
      exists (
        select 1 from public.conversations c
        join public.profiles p
          on (p.id = c.customer_profile_id or p.id = c.worker_profile_id)
        where c.id = messages.conversation_id
          and p.auth_user_id = auth.uid()
      )
    )
  `);
  console.log("RLS policy messages_select_participant dibuat.");

  console.log("Selesai.");
  await sql.end();
}

main().catch((err) => {
  console.error("Gagal:", err.message ?? err);
  process.exit(1);
});
