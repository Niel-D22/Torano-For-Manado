import { Link, useNavigate, useParams } from "react-router-dom";
import { getWorker, categoryMap } from "../data/workers";
import { useAuthGate } from "../lib/auth";
import MapView from "../components/MapView";
import {
  StarIcon,
  PinIcon,
  ShieldIcon,
  ChatIcon,
  WalletIcon,
  ArrowIcon,
} from "../components/icons";

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const Stars = ({ value }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i <= Math.round(value) ? "text-sun" : "text-line"}`}
      />
    ))}
  </span>
);

const portfolio = ["Sebelum", "Sesudah", "Hasil kerja", "Detail"];

const WorkerProfile = () => {
  const { id } = useParams();
  const worker = getWorker(id);
  const gate = useAuthGate();
  const navigate = useNavigate();

  // Lihat profil bebas; chat & booking butuh login (gerbang di sini).
  const chat = () => gate(() => navigate(`/chat/${id}`));
  const booking = () => gate(() => navigate(`/chat/${id}`));

  if (!worker) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink">Pekerja tidak ditemukan</h1>
        <Link
          to="/cari"
          className="mt-6 inline-flex rounded-xl bg-forest px-5 py-3 font-semibold text-white hover:bg-ink"
        >
          Kembali ke pencarian
        </Link>
      </div>
    );
  }

  const cat = categoryMap[worker.category];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Link
        to="/cari"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss transition-colors hover:text-ink"
      >
        <ArrowIcon className="h-4 w-4 rotate-180" />
        Kembali ke pencarian
      </Link>

      {/* Header profil */}
      <div className="mt-4 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-5">
            <div
              className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl text-2xl font-extrabold text-white sm:h-24 sm:w-24"
              style={{
                background: `linear-gradient(135deg, ${cat.color}, ${cat.color}bb)`,
              }}
            >
              {initials(worker.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-ink">
                  {worker.name}
                </h1>
                <span
                  className="grid h-5 w-5 place-items-center rounded-full bg-forest text-white"
                  title="Terverifikasi"
                >
                  <ShieldIcon className="h-3 w-3" />
                </span>
              </div>
              <p className="mt-1 text-moss">{worker.skill}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <StarIcon className="h-4 w-4 text-sun" />
                  {worker.rating.toFixed(1)}
                  <span className="font-normal text-moss">
                    ({worker.jobs} kerja)
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-moss">
                  <PinIcon className="h-4 w-4 text-leaf" />
                  {worker.area} · {worker.distanceKm.toFixed(1)} km
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ color: cat.color, background: `${cat.color}14` }}
                >
                  {cat.label}
                </span>
                {worker.available ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest">
                    <span className="h-2 w-2 rounded-full bg-leaf" />
                    Tersedia sekarang
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-moss">
                    Sedang sibuk
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={chat}
              className="ring-focus flex items-center gap-2 rounded-xl bg-forest px-5 py-3 font-semibold text-white transition-colors hover:bg-ink"
            >
              <ChatIcon className="h-5 w-5" />
              Chat & Tawar
            </button>
            <button
              onClick={booking}
              className="ring-focus rounded-xl border border-line bg-white px-5 py-3 font-semibold text-forest transition-colors hover:border-forest"
            >
              Booking
            </button>
          </div>
        </div>
      </div>

      {/* Konten dua kolom */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Utama */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-bold text-ink">Tentang {worker.name.split(" ")[0]}</h2>
            <p className="mt-2 leading-relaxed text-moss">{worker.about}</p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-ink">Bukti kerja</h2>
              <span className="text-sm text-moss">{portfolio.length} foto</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {portfolio.map((label, i) => (
                <div
                  key={label}
                  className="group relative aspect-square overflow-hidden rounded-xl"
                  style={{
                    background: `linear-gradient(150deg, ${cat.color}22, ${cat.color}0a)`,
                  }}
                >
                  <span
                    className="absolute inset-0 grid place-items-center opacity-40"
                    style={{ color: cat.color }}
                  >
                    <ShieldIcon className="h-8 w-8" />
                  </span>
                  <span className="absolute bottom-2 left-2 rounded-md bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-ink">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-ink">Ulasan</h2>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <StarIcon className="h-4 w-4 text-sun" />
                {worker.rating.toFixed(1)} dari {worker.jobs} kerja
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {worker.reviews.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-line bg-paper p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{r.name}</span>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-1.5 text-sm text-moss">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar info */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-6">
            <h2 className="font-bold text-ink">Ringkasan</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-moss">Kisaran tarif</dt>
                <dd className="font-bold text-ink">
                  Rp{worker.priceMin}–{worker.priceMax}rb
                  <span className="font-medium text-moss">/hari</span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-moss">Jarak</dt>
                <dd className="font-semibold text-ink">
                  {worker.distanceKm.toFixed(1)} km
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-moss">Kerja selesai</dt>
                <dd className="font-semibold text-ink">{worker.jobs}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-moss">Rating</dt>
                <dd className="flex items-center gap-1 font-semibold text-ink">
                  <StarIcon className="h-4 w-4 text-sun" />
                  {worker.rating.toFixed(1)}
                </dd>
              </div>
            </dl>

            {/* Signature: kepercayaan komunal */}
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-limesoft/60 px-3 py-3 text-forest">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">
                  Kepercayaan komunal
                </p>
                <p className="text-sm font-medium leading-snug">
                  {worker.trust}
                </p>
              </div>
            </div>

            <button
              onClick={booking}
              className="ring-focus mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 font-semibold text-white transition-colors hover:bg-ink"
            >
              <WalletIcon className="h-5 w-5" />
              Booking &amp; bayar aman
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="border-b border-line px-4 py-3">
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                <PinIcon className="h-4 w-4 text-leaf" />
                Lokasi di {worker.area}
              </p>
            </div>
            <div className="h-52">
              <MapView
                workers={[worker]}
                selectedId={worker.id}
                onSelect={() => {}}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WorkerProfile;
