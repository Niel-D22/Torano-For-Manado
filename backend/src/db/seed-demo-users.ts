import "dotenv/config";
import postgres from "postgres";

// Akun demo tiap peran, dibuat langsung di auth.users (lewat pgcrypto) agar
// lolos validasi domain Supabase, terkonfirmasi, dan bebas rate limit.
// Admin TIDAK di sini (login admin terpisah: username/password backend).
const INSTANCE = "00000000-0000-0000-0000-000000000000";

const DEMOS = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    email: "pencari@torano.app",
    password: "demo12345",
    name: "Demo Pencari",
    role: "customer",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    email: "pekerja@torano.app",
    password: "demo12345",
    name: "Demo Pekerja",
    role: "worker",
  },
];

async function main(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    console.error("DATABASE_URL wajib diisi");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { prepare: false });

  console.log("Membuat akun demo...");
  for (const d of DEMOS) {
    // Tulis ulang agar idempoten.
    await sql`delete from auth.users where email = ${d.email}`;
    await sql`delete from profiles where email = ${d.email}`;

    // Kolom token wajib '' (bukan NULL) agar GoTrue tidak error saat login.
    await sql`
      insert into auth.users
        (id, instance_id, aud, role, email, encrypted_password,
         email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
         confirmation_token, recovery_token, email_change,
         email_change_token_new, email_change_token_current,
         phone_change, phone_change_token, reauthentication_token,
         created_at, updated_at)
      values
        (${d.id}, ${INSTANCE}, 'authenticated', 'authenticated', ${d.email},
         crypt(${d.password}, gen_salt('bf')), now(),
         ${sql.json({ provider: "email", providers: ["email"] })},
         ${sql.json({ full_name: d.name, role: d.role })},
         '', '', '', '', '', '', '', '',
         now(), now())`;

    await sql`
      insert into profiles (auth_user_id, full_name, email, role)
      values (${d.id}, ${d.name}, ${d.email}, ${d.role}::user_role)`;

    console.log(`  ${d.email}  |  ${d.password}  |  peran: ${d.role}`);
  }

  console.log("Selesai.");
  await sql.end();
}

main().catch((err) => {
  console.error("Gagal:", err);
  process.exit(1);
});
