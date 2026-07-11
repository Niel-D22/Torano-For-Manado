-- ============================================================
-- TORANO — Skema Database (Supabase / PostgreSQL)
-- Jalankan di Supabase SQL Editor.
-- Alur yang didukung:
--   daftar (customer/mitra) → verifikasi mitra (selfie + referensi RT)
--   → cari pekerja → chat (teks/foto/lokasi/tawaran) → nego
--   → order (tunai / QRIS Midtrans) → dana ditahan (ledger)
--   → konfirmasi selesai → dilepas → dicairkan → ulasan → sengketa
-- ============================================================

-- ---------- 1. KATEGORI ----------
create table categories (
  id          text primary key,            -- 'art' | 'tukang' | 'event' | 'montir'
  label       text not null,               -- "ART & Bersih Rumah"
  short_label text not null,               -- "ART"
  color       text not null                -- untuk pin peta & badge
);

insert into categories (id, label, short_label, color) values
  ('art',    'ART & Bersih Rumah', 'ART',       '#16a34a'),
  ('tukang', 'Tukang Harian',      'Tukang',    '#ca8a04'),
  ('event',  'Kru Acara & Adat',   'Kru Event', '#0d3b2e'),
  ('montir', 'Montir Panggilan',   'Montir',    '#6b7280');

-- ---------- 2. PROFIL (semua akun; 1-1 dengan auth.users) ----------
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  phone      text unique not null,
  avatar_url text,
  role       text not null default 'customer'
             check (role in ('customer','worker','admin')),
  area       text,                          -- kelurahan, mis. "Wanea"
  created_at timestamptz not null default now()
);

-- ---------- 3. PEKERJA (perpanjangan profil untuk role worker) ----------
create table workers (
  id                  uuid primary key references profiles(id) on delete cascade,
  category_id         text not null references categories(id),
  skill               text not null,        -- "Renovasi & tukang batu"
  about               text,
  price_min           integer not null,     -- rupiah per jam
  price_max           integer not null,
  area                text not null,        -- kawasan kerja utama
  lat                 double precision,
  lng                 double precision,
  radius_km           numeric(4,1) default 5,
  is_available        boolean not null default true,
  -- verifikasi (halaman admin "Verifikasi Mitra")
  selfie_url          text,                 -- foto wajah realtime saat daftar
  verification_status text not null default 'pending'
                      check (verification_status in ('pending','approved','rejected')),
  verification_note   text,
  verified_at         timestamptz,
  trust_label         text,                 -- "Dikenal warga RT 03 Wanea"
  -- agregat reputasi (diisi trigger, jangan diedit manual)
  rating_avg          numeric(2,1) not null default 0,
  rating_count        integer not null default 0,
  jobs_done           integer not null default 0,
  created_at          timestamptz not null default now(),
  check (price_min <= price_max)
);

-- referensi komunitas ("Siapa yang mengenalmu di lingkunganmu?")
create table worker_references (
  id           uuid primary key default gen_random_uuid(),
  worker_id    uuid not null references workers(id) on delete cascade,
  relation     text not null
               check (relation in ('ketua_rt','jemaat_gereja','pengurus_mesjid','lainnya')),
  name         text not null,
  phone        text not null,
  is_contacted boolean not null default false,  -- dicentang admin
  admin_note   text                              -- "Catatan hasil konfirmasi"
);

-- portofolio foto hasil kerja
create table worker_photos (
  id         uuid primary key default gen_random_uuid(),
  worker_id  uuid not null references workers(id) on delete cascade,
  url        text not null,
  caption    text,
  created_at timestamptz not null default now()
);

-- tujuan pencairan dana (section "Metode Pencairan Dana" di profil mitra)
create table payout_accounts (
  id             uuid primary key default gen_random_uuid(),
  worker_id      uuid not null references workers(id) on delete cascade,
  type           text not null check (type in ('bank','ewallet')),
  provider       text not null,             -- 'BCA', 'GoPay', 'DANA'
  account_number text not null,
  account_name   text not null,
  is_primary     boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ---------- 4. CHAT ----------
create table conversations (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references profiles(id),
  worker_id       uuid not null references workers(id),
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (customer_id, worker_id)
);

-- tawaran harga (kartu "Tawaran" di chat; rantai nego via parent_offer_id)
create table offers (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id),
  amount          integer not null,          -- rupiah
  status          text not null default 'pending'
                  check (status in ('pending','accepted','countered','cancelled')),
  parent_offer_id uuid references offers(id),-- tawaran yang dibalas
  responded_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- pesan; satu tabel untuk semua tipe bubble di desain chat
create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid references profiles(id), -- null = pesan sistem
  type            text not null default 'text'
                  check (type in ('text','image','location','offer','system')),
  body            text,                       -- teks / label pesan sistem
  image_url       text,                       -- type = image
  location        jsonb,                      -- {lat, lng, address}
  offer_id        uuid references offers(id), -- type = offer
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- ---------- 5. ORDER (lahir saat tawaran disepakati) ----------
create table orders (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id),
  customer_id     uuid not null references profiles(id),
  worker_id       uuid not null references workers(id),
  offer_id        uuid not null references offers(id),
  title           text not null,              -- "Perbaikan tembok dapur retak"
  description     text,
  amount          integer not null,           -- harga disepakati
  service_fee     integer not null default 0, -- potongan Torano (dari pekerja)
  payment_method  text check (payment_method in ('cash','qris')),
  scheduled_at    timestamptz,
  address         text,
  lat             double precision,
  lng             double precision,
  status          text not null default 'agreed'
                  check (status in (
                    'agreed',            -- harga sepakat, belum pilih metode bayar
                    'awaiting_payment',  -- QRIS dibuat, menunggu scan
                    'paid',              -- QRIS lunas / tunai: langsung in_progress
                    'in_progress',       -- sedang dikerjakan
                    'worker_done',       -- pekerja tandai selesai
                    'completed',         -- customer konfirmasi (atau auto-release)
                    'cancelled',
                    'disputed'
                  )),
  worker_done_at  timestamptz,
  auto_release_at timestamptz,               -- worker_done_at + 2 hari
  completed_at    timestamptz,
  cancel_reason   text,
  created_at      timestamptz not null default now()
);

-- ---------- 6. PEMBAYARAN QRIS (Midtrans) ----------
create table payments (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references orders(id),
  midtrans_order_id text unique not null,    -- "TRN-240518-8F3XQ1"
  amount            integer not null,
  qr_url            text,                    -- URL gambar QRIS dari Midtrans
  status            text not null default 'pending'
                    check (status in ('pending','settled','expired','failed','refunded')),
  expires_at        timestamptz,             -- QRIS dinamis ±15 menit
  paid_at           timestamptz,
  raw_notification  jsonb,                   -- payload webhook, untuk audit
  created_at        timestamptz not null default now()
);

-- ---------- 7. LEDGER (escrow buatan sendiri) ----------
-- Uang fisik ada di rekening Torano; tabel ini yang "menahan".
-- amount bertanda: hold/refund/payout = pergerakan keluar-masuk kepemilikan.
-- Saldo pekerja = sum(amount) where worker_id = X and type in ('release','payout').
create table ledger_entries (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id),
  worker_id     uuid references workers(id),
  withdrawal_id uuid,                        -- diisi saat type = payout
  type          text not null
                check (type in (
                  'hold',      -- +amount  : dana QRIS masuk, DITAHAN
                  'release',   -- +amount  : DILEPAS ke saldo pekerja (net setelah fee)
                  'payout',    -- -amount  : DICAIRKAN ke rekening pekerja
                  'refund'     -- -amount  : dikembalikan ke customer
                )),
  amount        integer not null,
  note          text,
  created_at    timestamptz not null default now()
);

-- permintaan pencairan (tombol "Cairkan Dana" di halaman Penghasilan)
create table withdrawals (
  id                uuid primary key default gen_random_uuid(),
  worker_id         uuid not null references workers(id),
  payout_account_id uuid not null references payout_accounts(id),
  amount            integer not null,
  status            text not null default 'requested'
                    check (status in ('requested','processing','done','rejected')),
  processed_at      timestamptz,
  created_at        timestamptz not null default now()
);

-- ---------- 8. ULASAN ----------
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid unique not null references orders(id), -- 1 order = 1 ulasan
  customer_id uuid not null references profiles(id),
  worker_id   uuid not null references workers(id),
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  tags        text[],                       -- chip: {'Tepat waktu','Hasil rapi'}
  reply       text,                         -- balasan pekerja
  replied_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table review_photos (
  id        uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  url       text not null
);

-- ---------- 9. SENGKETA (halaman admin) ----------
create table disputes (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid unique not null references orders(id),
  opened_by   uuid not null references profiles(id),
  reason      text not null,                -- "Pekerjaan tidak selesai"
  description text,
  status      text not null default 'open'
              check (status in ('open','reviewing','resolved')),
  resolution  text check (resolution in ('release','refund','split')),
  admin_note  text,
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ---------- 10. INDEX ----------
create index idx_workers_category   on workers (category_id) where verification_status = 'approved';
create index idx_workers_available  on workers (is_available, verification_status);
create index idx_messages_conv      on messages (conversation_id, created_at);
create index idx_orders_customer    on orders (customer_id, created_at desc);
create index idx_orders_worker      on orders (worker_id, status);
create index idx_ledger_worker      on ledger_entries (worker_id, created_at desc);
create index idx_reviews_worker     on reviews (worker_id, created_at desc);

-- ---------- 11. TRIGGER ----------
-- agregat rating pekerja terbarui otomatis saat ulasan masuk
create or replace function refresh_worker_rating() returns trigger as $$
begin
  update workers w set
    rating_avg   = (select round(avg(rating)::numeric, 1) from reviews where worker_id = new.worker_id),
    rating_count = (select count(*) from reviews where worker_id = new.worker_id)
  where w.id = new.worker_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_refresh_worker_rating
after insert or update on reviews
for each row execute function refresh_worker_rating();

-- last_message_at untuk urutan inbox
create or replace function touch_conversation() returns trigger as $$
begin
  update conversations set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_touch_conversation
after insert on messages
for each row execute function touch_conversation();

-- jobs_done bertambah saat order selesai
create or replace function bump_jobs_done() returns trigger as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    update workers set jobs_done = jobs_done + 1 where id = new.worker_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_bump_jobs_done
after update on orders
for each row execute function bump_jobs_done();

-- ---------- 12. VIEW SALDO PEKERJA ----------
create or replace view worker_balances as
select
  worker_id,
  coalesce(sum(amount) filter (where type in ('release','payout')), 0) as balance,
  coalesce(sum(amount) filter (where type = 'hold'), 0)
    - coalesce(sum(amount) filter (where type in ('release','refund')), 0) as held
from ledger_entries
group by worker_id;

-- ---------- 13. ROW LEVEL SECURITY (aktifkan; policy detail menyusul) ----------
alter table profiles          enable row level security;
alter table workers           enable row level security;
alter table worker_references enable row level security;
alter table worker_photos     enable row level security;
alter table payout_accounts   enable row level security;
alter table conversations     enable row level security;
alter table messages          enable row level security;
alter table offers            enable row level security;
alter table orders            enable row level security;
alter table payments          enable row level security;
alter table ledger_entries    enable row level security;
alter table withdrawals       enable row level security;
alter table reviews           enable row level security;
alter table review_photos     enable row level security;
alter table disputes          enable row level security;

-- contoh policy dasar (lengkapi per tabel saat implementasi):
-- profil publik bisa dibaca semua orang yang login
create policy "profiles_read" on profiles for select using (true);
-- pekerja approved tampil publik (pencarian & peta)
create policy "workers_read" on workers for select
  using (verification_status = 'approved' or id = auth.uid());
-- chat hanya untuk pesertanya
create policy "conversations_participants" on conversations for select
  using (customer_id = auth.uid() or worker_id = auth.uid());
create policy "messages_participants" on messages for select
  using (exists (
    select 1 from conversations c
    where c.id = conversation_id
      and (c.customer_id = auth.uid() or c.worker_id = auth.uid())
  ));
