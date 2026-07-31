import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Flag, Clock, CheckCircle2, X, Send } from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import Avatar from "../../components/Avatar";
import Spinner from "../../components/Spinner";
import { ListSkeleton } from "../../components/Skeletons";

const ROLE_LABEL = { customer: "Pelanggan", worker: "Mitra", admin: "Admin" };

const tglJam = (iso) =>
  iso
    ? new Date(iso).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const StatusBadge = ({ status }) =>
  status === "resolved" ? (
    <span className="flex items-center gap-1 rounded-full bg-limesoft px-2.5 py-0.5 text-xs font-bold text-forest">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Selesai
    </span>
  ) : (
    <span className="flex items-center gap-1 rounded-full bg-sun/20 px-2.5 py-0.5 text-xs font-bold text-[#8a6a00]">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Terbuka
    </span>
  );

const TABS = [
  { key: "open", label: "Terbuka" },
  { key: "resolved", label: "Selesai" },
  { key: "all", label: "Semua" },
];

const AdminLaporan = () => {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ all: 0, open: 0, resolved: 0 });
  const [tab, setTab] = useState("open");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .get("/admin/reports")
      .then((r) => {
        setRows(r.data.data);
        if (r.data.meta?.counts) setCounts(r.data.meta.counts);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const byTab = tab === "all" ? rows : rows.filter((r) => r.status === tab);
    const term = q.trim().toLowerCase();
    if (!term) return byTab;
    return byTab.filter((r) =>
      [r.subject, r.reporterName, r.category, r.message].some((v) =>
        String(v || "").toLowerCase().includes(term),
      ),
    );
  }, [rows, tab, q]);

  const openDetail = (r) => {
    setActive(r);
    setReply(r.adminReply || "");
  };

  const save = async (markResolved) => {
    if (!active) return;
    setBusy(true);
    try {
      const body = { adminReply: reply.trim() };
      if (markResolved) body.status = "resolved";
      else if (active.status === "resolved") body.status = "open";
      const { data } = await adminApi.patch(`/admin/reports/${active.id}`, body);
      toast.success(markResolved ? "Laporan ditandai selesai" : "Balasan tersimpan");
      setActive(null);
      setRows((prev) => prev.map((x) => (x.id === active.id ? data.data.report : x)));
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-white">
          <Flag className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">Laporan Pengguna</h1>
          <p className="text-sm text-moss">Kendala dari pelanggan dan mitra yang perlu ditindak.</p>
        </div>
      </div>

      {/* Tab + cari */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 rounded-xl border border-line bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                tab === t.key ? "bg-forest text-white" : "text-moss hover:bg-cloud"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-80">{counts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari laporan"
            className="ring-focus h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm text-ink focus:outline-none"
          />
        </div>
      </div>

      {/* Daftar */}
      <div className="mt-4">
        {loading ? (
          <ListSkeleton count={4} title={false} />
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-moss">
            Tidak ada laporan pada kategori ini.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => openDetail(r)}
                className="flex w-full items-start gap-3 rounded-2xl border border-line bg-white p-4 text-left transition-colors hover:border-forest/40 hover:bg-cloud/40"
              >
                <Avatar name={r.reporterName} className="h-10 w-10 shrink-0" textClass="text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink">{r.subject}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate">
                    {r.reporterName} · {ROLE_LABEL[r.reporterRole] || r.reporterRole} · {r.category} ·{" "}
                    {tglJam(r.createdAt)}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-moss">{r.message}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail + balasan */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-white sm:max-w-lg sm:rounded-3xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-5 py-4">
              <h2 className="font-extrabold text-ink">Detail Laporan</h2>
              <button
                onClick={() => setActive(null)}
                className="rounded-lg p-1.5 text-moss hover:bg-cloud"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <Avatar name={active.reporterName} className="h-11 w-11" textClass="text-sm" />
                <div className="min-w-0">
                  <p className="font-bold text-ink">{active.reporterName}</p>
                  <p className="text-xs text-slate">
                    {ROLE_LABEL[active.reporterRole] || active.reporterRole}
                    {active.reporterEmail ? ` · ${active.reporterEmail}` : ""}
                  </p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={active.status} />
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-cloud/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate">{active.category}</p>
                <p className="mt-1 font-bold text-ink">{active.subject}</p>
                <p className="mt-2 whitespace-pre-line text-sm text-moss">{active.message}</p>
                <p className="mt-3 text-[11px] text-slate">Dikirim {tglJam(active.createdAt)}</p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-ink">Balasan admin</span>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Tulis tanggapan untuk pengguna…"
                  className="ring-focus min-h-28 w-full resize-y rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:outline-none"
                  maxLength={2000}
                />
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => save(false)}
                  disabled={busy}
                  className="ring-focus flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-bold text-ink hover:bg-cloud disabled:opacity-70"
                >
                  {busy ? <Spinner /> : <Send className="h-4 w-4" />} Simpan Balasan
                </button>
                {active.status !== "resolved" && (
                  <button
                    onClick={() => save(true)}
                    disabled={busy}
                    className="ring-focus flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white hover:bg-ink disabled:opacity-70"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Tandai Selesai
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLaporan;
