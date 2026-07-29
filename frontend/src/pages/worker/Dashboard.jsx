import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  MessageSquareText,
  Check,
  ArrowUpRight,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  partner,
  partnerRequests,
  partnerSchedule,
  partnerSOS,
} from "../../data/partner";

const rupiah = (ribu) => "Rp" + (ribu * 1000).toLocaleString("id-ID");

const scheduleTone = {
  berlangsung: { label: "Berlangsung", cls: "bg-forest text-white" },
  menuju: { label: "Menuju lokasi", cls: "bg-sun/20 text-[#8a6a00]" },
  menunggu: { label: "Menunggu", cls: "bg-cloud text-moss" },
};

const StatTile = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-2xl border border-line bg-white p-4">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-limesoft text-forest">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <p className="mt-3 text-2xl font-extrabold text-ink">{value}</p>
    <p className="text-sm text-moss">{label}</p>
    {sub && <p className="mt-0.5 text-xs text-moss/80">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const [requests, setRequests] = useState(partnerRequests);
  const setStatus = (id, status) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Halo, {partner.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-moss">
          Berikut ringkasan kerjamu hari ini.
        </p>
      </header>

      {/* ── Ringkasan: saldo (hero) + statistik ── */}
      <section className="mt-5 grid gap-4 lg:grid-cols-4">
        <div className="bg-brand relative overflow-hidden rounded-2xl p-5 text-white lg:col-span-2">
          <p className="text-sm text-white/80">Saldo aktif</p>
          <p className="mt-1 text-3xl font-extrabold">{rupiah(partner.balance)}</p>
          <div className="mt-4 flex items-center gap-3">
            <Link
              to="/mitra/saldo"
              className="ring-focus inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-forest transition-colors hover:bg-paper"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              Tarik saldo
            </Link>
            <span className="text-sm text-white/80">
              +{rupiah(partner.weeklyEarning)} minggu ini
            </span>
          </div>
        </div>

        <StatTile
          icon={CheckCircle2}
          value={partner.weeklyJobs}
          label="Kerja selesai"
          sub="Minggu ini"
        />
        <StatTile
          icon={Star}
          value={partner.rating.toFixed(1)}
          label="Rating rata-rata"
          sub={`${partner.jobsDone} pekerjaan`}
        />
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* ── Permintaan masuk ── */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-ink">Permintaan masuk</h2>
            <span className="rounded-full bg-limesoft px-2.5 py-1 text-xs font-bold text-forest">
              {newCount} baru
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {requests.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-line bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-ink">{r.job}</p>
                    <p className="mt-0.5 text-sm text-moss">{r.customer}</p>
                  </div>
                  <span className="shrink-0 font-extrabold text-forest">
                    {rupiah(r.price)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-moss">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-forest" aria-hidden="true" />
                    {r.area} · {r.distanceKm} km
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {r.when}
                  </span>
                </div>

                {r.status === "new" ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setStatus(r.id, "declined")}
                      className="ring-focus flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-moss transition-colors hover:border-moss/50"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => setStatus(r.id, "accepted")}
                      className="ring-focus flex-1 rounded-xl bg-forest py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink"
                    >
                      Terima
                    </button>
                  </div>
                ) : r.status === "accepted" ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-limesoft/60 px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-forest">
                      <Check className="h-4 w-4" aria-hidden="true" /> Diterima
                    </span>
                    <Link
                      to="/chat/1"
                      className="flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-ink"
                    >
                      <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                      Chat pelanggan
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl bg-cloud px-3 py-2.5 text-sm font-medium text-moss">
                    Permintaan ditolak
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ── Kolom kanan: SOS + jadwal hari ini ── */}
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-sun/50 bg-sun/10">
            <div className="flex items-center gap-2 border-b border-sun/30 px-4 py-2.5">
              <Zap className="h-4 w-4 text-[#8a6a00]" aria-hidden="true" />
              <span className="text-sm font-bold text-[#8a6a00]">
                Kerja mendadak
              </span>
            </div>
            <div className="p-4">
              <p className="font-bold text-ink">{partnerSOS.job}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-moss">
                <MapPin className="h-4 w-4 text-forest" aria-hidden="true" />
                {partnerSOS.area} · {partnerSOS.distanceKm} km · butuh sekarang
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-extrabold text-ink">
                  {rupiah(partnerSOS.price)}
                </span>
                <button className="ring-focus rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink">
                  Ambil
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-ink">Jadwal hari ini</h2>
              <Link
                to="/mitra/jadwal"
                className="flex items-center gap-0.5 text-sm font-semibold text-forest hover:text-ink"
              >
                Semua <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <ol className="mt-3 space-y-3">
              {partnerSchedule.map((s) => {
                const tone = scheduleTone[s.status];
                return (
                  <li key={s.id} className="flex gap-3">
                    <div className="w-12 shrink-0 text-sm font-bold text-ink">
                      {s.time}
                    </div>
                    <div className="min-w-0 flex-1 border-l border-line pl-3">
                      <p className="truncate text-sm font-semibold text-ink">
                        {s.job}
                      </p>
                      <p className="text-xs text-moss">
                        {s.customer} · {s.area}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.cls}`}
                      >
                        {tone.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
