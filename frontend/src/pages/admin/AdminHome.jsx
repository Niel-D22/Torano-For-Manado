import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Lock,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { adminApi, getAdminName } from "../../lib/adminApi";
import Avatar from "../../components/Avatar";
import Spinner from "../../components/Spinner";

const rupiahCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e9) return "Rp" + (v / 1e9).toFixed(1).replace(".", ",") + "M";
  if (v >= 1e6) return "Rp" + (v / 1e6).toFixed(1).replace(".", ",") + "jt";
  if (v >= 1e3) return "Rp" + (v / 1e3).toFixed(0) + "rb";
  return "Rp" + v;
};
const timeAgo = (iso) => {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
};

const DONUT_COLORS = ["#0d3b2e", "#ca8a04", "#8a3ffc", "#e5484d", "#16a34a", "#0ea5e9"];

const StatCard = ({ icon: Icon, tone, label, value, link, linkLabel, linkTone }) => (
  <div className="rounded-2xl border border-line bg-white p-5">
    <div className="flex items-center gap-3">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-moss">{label}</p>
        <p className="truncate text-2xl font-extrabold text-ink">{value}</p>
      </div>
    </div>
    <Link
      to={link}
      className={`mt-3 inline-flex items-center gap-1 text-sm font-bold hover:underline ${linkTone}`}
    >
      {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  </div>
);

// Grafik garis sederhana (SVG, tanpa library).
const LineChart = ({ days }) => {
  const totals = days.map((d) => d.total);
  const max = Math.max(...totals, 1);
  const n = days.length;
  const W = 100;
  const H = 42;
  const pts = days.map((d, i) => {
    const x = n > 1 ? (i / (n - 1)) * W : 0;
    const y = H - (d.total / max) * (H - 6) - 3;
    return [x, y];
  });
  const line = pts.map((p) => `${p[0]},${p[1]}`).join(" ");
  const area = `0,${H} ${line} ${W},${H}`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-44 w-full">
        <polygon points={area} fill="rgba(22,163,74,0.10)" />
        <polyline points={line} fill="none" stroke="#16a34a" strokeWidth="0.8" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="0.9" fill="#0d3b2e" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-moss">
        {days.map((d) => (
          <span key={d.date}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

// Donut kategori (SVG stroke-dasharray).
const Donut = ({ segments, total }) => {
  const R = 16;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg viewBox="0 0 40 40" className="h-40 w-40 -rotate-90">
      <circle cx="20" cy="20" r={R} fill="none" stroke="#eef0ec" strokeWidth="6" />
      {segments.map((s, i) => {
        const len = (s.pct / 100) * C;
        const el = (
          <circle
            key={i}
            cx="20"
            cy="20"
            r={R}
            fill="none"
            stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
            strokeWidth="6"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-offset}
          />
        );
        offset += len;
        return el;
      })}
      <text
        x="20"
        y="21"
        textAnchor="middle"
        style={{ transform: "rotate(90deg)", transformOrigin: "20px 20px", fontSize: "6px", fontWeight: 800, fill: "#12241d" }}
      >
        {total}
      </text>
    </svg>
  );
};

const AdminHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .get("/admin/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="h-8 w-8 text-forest" />
      </div>
    );
  }
  if (!data) return <div className="p-8 text-moss">Gagal memuat dashboard.</div>;

  const { stats, chart, categoryBreakdown, categoryTotal, activity, needsAction } = data;
  const actIcon = { register: UserPlus, completed: CheckCircle2, payout: Wallet };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Selamat datang, {getAdminName().split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-moss">Berikut ringkasan aktivitas Torano hari ini.</p>
      </header>

      {/* Kartu statistik */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          tone="bg-sun/20 text-[#8a6a00]"
          label="Mitra menunggu verifikasi"
          value={stats.pendingVerification}
          link="/admin/verifikasi"
          linkLabel="Lihat & verifikasi"
          linkTone="text-[#8a6a00]"
        />
        <StatCard
          icon={TrendingUp}
          tone="bg-limesoft text-forest"
          label="Transaksi hari ini"
          value={rupiahCompact(stats.transactionsToday)}
          link="/admin/transaksi"
          linkLabel="Lihat semua transaksi"
          linkTone="text-forest"
        />
        <StatCard
          icon={Lock}
          tone="bg-forest/10 text-forest"
          label="Dana escrow ditahan"
          value={rupiahCompact(stats.escrowHeld)}
          link="/admin/transaksi"
          linkLabel="Lihat detail dana"
          linkTone="text-forest"
        />
        <StatCard
          icon={AlertTriangle}
          tone="bg-red-50 text-red-600"
          label="Sengketa terbuka"
          value={stats.openDisputes}
          link="/admin/sengketa"
          linkLabel="Lihat sengketa"
          linkTone="text-red-600"
        />
      </section>

      {/* Grafik */}
      <section className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-extrabold text-ink">Transaksi (7 hari terakhir)</h2>
          <div className="mt-4">
            <LineChart days={chart.days} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
            <span className="font-bold text-ink">Total 7 hari: {rupiahCompact(chart.total7)}</span>
            {chart.changePct != null && (
              <span className={chart.changePct >= 0 ? "text-forest" : "text-red-600"}>
                {chart.changePct >= 0 ? "naik" : "turun"} {Math.abs(chart.changePct)}% dari 7 hari sebelumnya
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-extrabold text-ink">Pekerjaan berdasarkan kategori</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-moss">Belum ada data pekerjaan.</p>
          ) : (
            <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative grid place-items-center">
                <Donut segments={categoryBreakdown} total={categoryTotal} />
              </div>
              <ul className="flex-1 space-y-2">
                {categoryBreakdown.map((c, i) => (
                  <li key={c.name} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                    />
                    <span className="flex-1 text-ink">{c.name}</span>
                    <span className="font-semibold text-moss">
                      {c.count} ({c.pct}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Aktivitas & perlu tindakan */}
      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-extrabold text-ink">Aktivitas terbaru</h2>
          <ul className="mt-3 space-y-3">
            {activity.map((a, i) => {
              const Icon = actIcon[a.kind] ?? CheckCircle2;
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-limesoft text-forest">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{a.title}</p>
                    <p className="truncate text-xs text-moss">{a.sub}</p>
                  </div>
                  <span className="shrink-0 text-xs text-moss">{timeAgo(a.at)}</span>
                </li>
              );
            })}
            {activity.length === 0 && <p className="text-sm text-moss">Belum ada aktivitas.</p>}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-extrabold text-ink">Perlu tindakan</h2>
          <ul className="mt-3 space-y-3">
            {needsAction.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <Avatar src={a.avatar} name={a.name} className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{a.name}</p>
                  <p className="truncate text-xs text-moss">{a.sub}</p>
                </div>
                <span
                  className={`hidden rounded-full px-2 py-0.5 text-[11px] font-bold sm:inline ${
                    a.type === "verify" ? "bg-sun/20 text-[#8a6a00]" : "bg-red-50 text-red-600"
                  }`}
                >
                  {a.type === "verify" ? "Verifikasi pending" : "Menunggu respon"}
                </span>
                <Link
                  to={a.type === "verify" ? "/admin/verifikasi" : "/admin/sengketa"}
                  className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:border-forest hover:text-forest"
                >
                  {a.type === "verify" ? "Verifikasi" : "Tinjau"}
                </Link>
              </li>
            ))}
            {needsAction.length === 0 && (
              <li className="flex items-center gap-2 text-sm text-moss">
                <ShieldCheck className="h-4 w-4 text-forest" /> Semua beres, tidak ada yang perlu ditindak.
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AdminHome;
