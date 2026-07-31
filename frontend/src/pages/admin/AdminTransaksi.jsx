import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Lock,
  Wallet,
} from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import Avatar from "../../components/Avatar";
import Spinner from "../../components/Spinner";

const TRX_STATUS = {
  held: { label: "Ditahan", cls: "bg-sun/20 text-[#8a6a00]" },
  released: { label: "Dilepas", cls: "bg-limesoft text-forest" },
  refunded: { label: "Refund", cls: "bg-red-50 text-red-600" },
  pending: { label: "Menunggu", cls: "bg-cloud text-moss" },
};

const rupiahFull = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
const rupiahCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e6) return "Rp" + (v / 1e6).toFixed(1).replace(".", ",") + "jt";
  if (v >= 1e3) return "Rp" + (v / 1e3).toFixed(0) + "rb";
  return "Rp" + v;
};
const tglJam = (iso) =>
  iso
    ? new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "-";

const AdminTransaksi = () => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi
      .get("/admin/transactions")
      .then((r) => {
        setData(r.data.data);
        setMeta(r.data.meta);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((d) => {
      if (tab !== "all" && tab !== "pencairan" && d.status !== tab) return false;
      if (term && !`${d.code} ${d.customer.name} ${d.worker.name} ${d.jobTitle}`.toLowerCase().includes(term))
        return false;
      return true;
    });
  }, [data, tab, q]);

  const exportCSV = () => {
    const rows = filtered;
    if (rows.length === 0) return toast.error("Tidak ada transaksi untuk diekspor");
    const head = ["ID Transaksi", "Pelanggan", "Mitra", "Pekerjaan", "Jumlah", "Biaya Layanan", "Diterima Pekerja", "Status", "Tanggal"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [head.map(esc).join(",")];
    rows.forEach((t) =>
      lines.push(
        [t.code, t.customer.name, t.worker.name, t.jobTitle, t.amount, t.fee, t.workerAmount, t.status, tglJam(t.date)]
          .map(esc)
          .join(","),
      ),
    );
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaksi-torano-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} transaksi diekspor`);
  };

  const processWithdrawal = async (id) => {
    try {
      await adminApi.patch(`/admin/withdrawals/${id}/process`);
      toast.success("Pencairan diproses");
      load();
    } catch {
      toast.error("Gagal memproses pencairan");
    }
  };

  const counts = meta?.counts ?? { all: 0, held: 0, released: 0, refunded: 0, pencairan: 0 };
  const TABS = [
    ["all", "Semua", null],
    ["held", "Ditahan (Escrow)", counts.held],
    ["released", "Dilepas", counts.released],
    ["refunded", "Refund", counts.refunded],
    ["pencairan", "Pencairan", counts.pencairan],
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Transaksi</h1>
        <p className="mt-1 text-sm text-moss">Pantau semua aktivitas transaksi di platform Torano</p>
      </header>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
        {/* ── Tabel transaksi ── */}
        <section className="min-w-0 rounded-2xl border border-line bg-white p-4 sm:p-5">
          <div className="flex flex-wrap gap-4 border-b border-line pb-3 text-sm font-bold">
            {TABS.map(([key, label, n]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 border-b-2 pb-2 transition-colors ${
                  tab === key ? "border-forest text-forest" : "border-transparent text-moss hover:text-ink"
                }`}
              >
                {label}
                {n != null && (
                  <span className={`rounded-full px-1.5 text-xs ${tab === key ? "bg-limesoft text-forest" : "bg-cloud text-moss"}`}>
                    {n}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-paper px-3">
              <Search className="h-4 w-4 text-moss" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari transaksi, nama, atau ID..."
                className="h-10 w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={exportCSV}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-semibold text-ink hover:bg-cloud"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {/* Konten */}
          {loading ? (
            <div className="grid place-items-center py-20">
              <Spinner className="h-8 w-8 text-forest" />
            </div>
          ) : tab === "pencairan" ? (
            <WithdrawalList items={meta?.withdrawalRequests ?? []} onProcess={processWithdrawal} />
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center py-20 text-sm text-moss">Tidak ada transaksi.</div>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-moss">
                    <th className="py-3 pr-3">ID Transaksi</th>
                    <th className="px-3 py-3">Pelanggan → Mitra</th>
                    <th className="px-3 py-3">Pekerjaan</th>
                    <th className="px-3 py-3">Jumlah</th>
                    <th className="px-3 py-3">Biaya</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Tanggal</th>
                    <th className="py-3 pl-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const st = TRX_STATUS[t.status] ?? TRX_STATUS.pending;
                    const open = expanded === t.id;
                    return (
                      <Fragment key={t.id}>
                        <tr
                          onClick={() => setExpanded(open ? null : t.id)}
                          className={`cursor-pointer border-b border-line/70 transition-colors ${open ? "bg-limesoft/20" : "hover:bg-cloud/50"}`}
                        >
                          <td className="py-3 pr-3 font-semibold text-ink">{t.code}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <Avatar src={t.customer.avatar} name={t.customer.name} className="h-7 w-7" textClass="text-[10px]" />
                              <span className="max-w-[90px] truncate text-xs font-semibold text-ink">{t.customer.name}</span>
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-moss" />
                              <Avatar src={t.worker.avatar} name={t.worker.name} className="h-7 w-7" textClass="text-[10px]" />
                              <span className="max-w-[90px] truncate text-xs font-semibold text-ink">{t.worker.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-moss">{t.jobTitle}</td>
                          <td className="px-3 py-3 font-bold text-ink">{rupiahFull(t.amount)}</td>
                          <td className="px-3 py-3 text-moss">{rupiahFull(t.fee)}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
                          </td>
                          <td className="px-3 py-3 text-xs text-moss">{tglJam(t.date)}</td>
                          <td className="py-3 pl-3 text-right text-moss">
                            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                          </td>
                        </tr>
                        {open && (
                          <tr>
                            <td colSpan={8} className="bg-paper/60 px-4 py-4">
                              <Timeline steps={t.timeline} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Ringkasan kanan ── */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-extrabold text-ink">Ringkasan Transaksi</h2>
            <div className="mt-3 rounded-2xl border border-sun/40 bg-sun/5 p-4">
              <p className="text-sm font-semibold text-[#8a6a00]">Dana escrow ditahan</p>
              <p className="mt-1 text-3xl font-extrabold text-[#8a6a00]">{rupiahCompact(meta?.escrowHeld ?? 0)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-moss">
                <Lock className="h-3 w-3" /> {meta?.heldCount ?? 0} transaksi ditahan
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-ink">Permintaan pencairan</h2>
              <span className="rounded-full bg-limesoft px-2 py-0.5 text-xs font-bold text-forest">
                {(meta?.withdrawalRequests ?? []).length}
              </span>
            </div>
            {(meta?.withdrawalRequests ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-moss">Tidak ada permintaan pencairan.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {meta.withdrawalRequests.map((w) => (
                  <li key={w.id} className="rounded-xl border border-line p-3">
                    <div className="flex items-center gap-2">
                      <Avatar src={w.avatar} name={w.name} className="h-9 w-9" textClass="text-xs" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{w.name}</p>
                        <p className="truncate text-xs text-moss">{w.category}</p>
                      </div>
                      <p className="shrink-0 text-sm font-extrabold text-ink">{rupiahFull(w.amount)}</p>
                    </div>
                    <button
                      onClick={() => processWithdrawal(w.id)}
                      className="mt-2 w-full rounded-lg bg-sun/15 py-2 text-sm font-bold text-[#8a6a00] hover:bg-sun/25"
                    >
                      Proses Pencairan
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-extrabold text-ink">Statistik Minggu Ini</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[
                ["Total transaksi", meta?.weekly?.total ?? 0],
                ["Transaksi dilepas", meta?.weekly?.released ?? 0],
                ["Transaksi ditahan", meta?.weekly?.held ?? 0],
                ["Total volume", rupiahCompact(meta?.weekly?.volume ?? 0)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-line/60 pb-2 last:border-0">
                  <dt className="text-moss">{k}</dt>
                  <dd className="font-bold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Timeline = ({ steps }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
    {steps.map((s, i) => {
      const done = Boolean(s.at);
      return (
        <div key={i} className="flex flex-1 gap-2">
          <div className="flex flex-col items-center">
            <span className={`grid h-6 w-6 place-items-center rounded-full ${done ? "bg-forest text-white" : "bg-cloud text-moss"}`}>
              <CheckCircle2 className="h-4 w-4" />
            </span>
            {i < steps.length - 1 && <span className="hidden h-full w-px bg-line sm:block" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">{s.label}</p>
            <p className="text-xs text-moss">{s.at ? tglJam(s.at) : "Menunggu"}</p>
            <p className="mt-0.5 text-xs text-moss">{s.note}</p>
          </div>
        </div>
      );
    })}
  </div>
);

const WithdrawalList = ({ items, onProcess }) => (
  <div className="mt-3">
    {items.length === 0 ? (
      <div className="grid place-items-center py-16 text-sm text-moss">Tidak ada permintaan pencairan.</div>
    ) : (
      <ul className="divide-y divide-line">
        {items.map((w) => (
          <li key={w.id} className="flex items-center gap-3 py-3">
            <Avatar src={w.avatar} name={w.name} className="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{w.name}</p>
              <p className="truncate text-xs text-moss">{w.category}</p>
            </div>
            <p className="shrink-0 text-sm font-extrabold text-ink">{rupiahFull(w.amount)}</p>
            <button
              onClick={() => onProcess(w.id)}
              className="shrink-0 rounded-lg bg-forest px-3 py-2 text-sm font-bold text-white hover:bg-ink"
            >
              <span className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4" /> Proses
              </span>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default AdminTransaksi;
