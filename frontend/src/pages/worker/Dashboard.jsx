import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  MessageSquareText,
  Check,
  ArrowUpRight,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { api } from "../../lib/api";
import Spinner from "../../components/Spinner";

const rupiah = (rb) => "Rp" + (Number(rb || 0) * 1000).toLocaleString("id-ID");
const jam = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";

const scheduleTone = {
  scheduled: { label: "Terjadwal", cls: "bg-forest text-white" },
  accepted: { label: "Diterima", cls: "bg-limesoft text-forest" },
  new: { label: "Baru", cls: "bg-sun/20 text-[#8a6a00]" },
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/worker/me/dashboard").then((r) => setData(r.data.data));
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/worker/me/bookings/${id}/status`, { status });
      await load();
      toast.success(status === "declined" ? "Permintaan ditolak" : "Permintaan diterima");
    } catch {
      toast.error("Gagal memproses");
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-moss">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const { profile, stats, incoming = [], today = [] } = data || {};

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Halo, {profile?.fullName?.split(" ")[0] ?? "Mitra"}
        </h1>
        <p className="mt-1 text-sm text-moss">Berikut ringkasan kerjamu.</p>
      </header>

      <section className="mt-5 grid gap-4 lg:grid-cols-4">
        <div className="bg-brand relative overflow-hidden rounded-2xl p-5 text-white lg:col-span-2">
          <p className="text-sm text-white/80">Saldo aktif</p>
          <p className="mt-1 text-3xl font-extrabold">{rupiah(stats?.balance)}</p>
          <div className="mt-4 flex items-center gap-3">
            <Link
              to="/mitra/penghasilan"
              className="ring-focus inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-forest transition-colors hover:bg-paper"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              Tarik saldo
            </Link>
            <span className="text-sm text-white/80">
              +{rupiah(stats?.weeklyEarning)} minggu ini
            </span>
          </div>
        </div>

        <StatTile icon={CheckCircle2} value={stats?.weeklyJobs ?? 0} label="Selesai minggu ini" />
        <StatTile
          icon={Star}
          value={stats?.rating ?? "-"}
          label="Rating"
          sub={`${stats?.reviewCount ?? 0} ulasan`}
        />
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-ink">Permintaan masuk</h2>
            <span className="rounded-full bg-limesoft px-2.5 py-1 text-xs font-bold text-forest">
              {incoming.length} baru
            </span>
          </div>

          {incoming.length > 0 ? (
            <div className="mt-3 space-y-3">
              {incoming.map((r) => (
                <article key={r.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{r.jobTitle}</p>
                      <p className="mt-0.5 text-sm text-moss">{r.customerName}</p>
                    </div>
                    <span className="shrink-0 font-extrabold text-forest">{rupiah(r.price)}</span>
                  </div>
                  {r.area && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-moss">
                      <MapPin className="h-4 w-4 text-forest" aria-hidden="true" />
                      {r.area}
                    </p>
                  )}
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
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-3 grid place-items-center rounded-2xl border border-dashed border-line bg-white py-12 text-center">
              <Inbox className="h-8 w-8 text-moss" aria-hidden="true" />
              <p className="mt-2 text-sm text-moss">Belum ada permintaan baru.</p>
            </div>
          )}
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
          {today.length > 0 ? (
            <ol className="mt-3 space-y-3">
              {today.map((s) => {
                const tone = scheduleTone[s.status] ?? scheduleTone.scheduled;
                return (
                  <li key={s.id} className="flex gap-3">
                    <div className="w-12 shrink-0 text-sm font-bold text-ink">{jam(s.scheduledAt)}</div>
                    <div className="min-w-0 flex-1 border-l border-line pl-3">
                      <p className="truncate text-sm font-semibold text-ink">{s.jobTitle}</p>
                      <p className="text-xs text-moss">
                        {s.customerName}
                        {s.area ? ` · ${s.area}` : ""}
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
          ) : (
            <div className="mt-3 grid place-items-center py-8 text-center">
              <Clock className="h-7 w-7 text-moss" aria-hidden="true" />
              <p className="mt-2 text-sm text-moss">Tidak ada jadwal hari ini.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
