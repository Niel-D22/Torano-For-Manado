import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Copy,
  Lock,
  AlertCircle,
  Clock,
  CheckCircle2,
  HandCoins,
  Undo2,
  Split,
  Scale,
} from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import Avatar from "../../components/Avatar";
import Spinner from "../../components/Spinner";

const DS_STATUS = {
  open: { label: "Terbuka", cls: "bg-sun/20 text-[#8a6a00]" },
  reviewing: { label: "Ditinjau", cls: "bg-[#2f80ed]/15 text-[#2f80ed]" },
  resolved: { label: "Selesai", cls: "bg-limesoft text-forest" },
};

const rupiahFull = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
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
const timeAgo = (iso) => {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
};

const StatusBadge = ({ status }) => {
  const s = DS_STATUS[status] ?? DS_STATUS.open;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cls}`}>{s.label}</span>;
};

const AdminSengketa = () => {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ all: 0, open: 0, reviewing: 0, resolved: 0 });
  const [tab, setTab] = useState("open");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .get("/admin/disputes")
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
    const term = q.trim().toLowerCase();
    return rows.filter((d) => {
      if (tab !== "all" && d.status !== tab) return false;
      if (term && !`${d.code} ${d.customer.name} ${d.worker.name} ${d.jobTitle}`.toLowerCase().includes(term))
        return false;
      return true;
    });
  }, [rows, tab, q]);

  const openDispute = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      // Membuka sengketa memindahkannya ke status Ditinjau.
      await adminApi.patch(`/admin/disputes/${id}/review`).catch(() => {});
      const r = await adminApi.get(`/admin/disputes/${id}`);
      setDetail(r.data.data.dispute);
      load();
    } catch {
      toast.error("Gagal memuat sengketa");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Sengketa</h1>
        <p className="mt-1 text-sm text-moss">Kelola dan selesaikan sengketa antara pelanggan dan mitra</p>
      </header>

      <div className="mt-5 grid gap-5 xl:grid-cols-[400px_1fr]">
        {/* ── Daftar sengketa ── */}
        <section className="rounded-2xl border border-line bg-white p-4">
          <div className="flex flex-wrap gap-4 border-b border-line pb-3 text-sm font-bold">
            {[
              ["all", "Semua", counts.all],
              ["open", "Terbuka", counts.open],
              ["reviewing", "Ditinjau", counts.reviewing],
              ["resolved", "Selesai", counts.resolved],
            ].map(([key, label, n]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 border-b-2 pb-2 transition-colors ${
                  tab === key ? "border-forest text-forest" : "border-transparent text-moss hover:text-ink"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    tab === key ? "bg-limesoft text-forest" : "bg-cloud text-moss"
                  }`}
                >
                  {n}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-paper px-3">
            <Search className="h-4 w-4 text-moss" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari ID, nama, atau pekerjaan..."
              className="h-10 w-full bg-transparent text-sm focus:outline-none"
            />
          </div>

          <div className="mt-3 max-h-[calc(100vh-18rem)] space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <div className="grid place-items-center py-16">
                <Spinner className="h-7 w-7 text-forest" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="grid place-items-center gap-2 py-16 text-center text-sm text-moss">
                <Scale className="h-8 w-8 text-line" />
                Tidak ada sengketa.
              </div>
            ) : (
              filtered.map((d) => (
                <button
                  key={d.id}
                  onClick={() => openDispute(d.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                    selectedId === d.id
                      ? "border-forest bg-limesoft/20 ring-1 ring-forest/30"
                      : "border-line hover:border-forest/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink">#{d.code}</span>
                      <StatusBadge status={d.status} />
                    </span>
                    <span className="text-xs text-moss">{timeAgo(d.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Avatar src={d.customer.avatar} name={d.customer.name} className="h-7 w-7" textClass="text-[10px]" />
                      <span className="truncate text-xs">
                        <span className="block font-semibold text-ink">{d.customer.name}</span>
                        <span className="text-moss">Pelanggan</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-moss">vs</span>
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Avatar src={d.worker.avatar} name={d.worker.name} className="h-7 w-7" textClass="text-[10px]" />
                      <span className="truncate text-xs">
                        <span className="block font-semibold text-ink">{d.worker.name}</span>
                        <span className="text-moss">Mitra</span>
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="truncate text-sm text-moss">{d.jobTitle}</span>
                    <span className="shrink-0 text-sm font-extrabold text-ink">{rupiahFull(d.amount)}</span>
                  </div>
                  {d.status !== "resolved" && (
                    <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-[#8a6a00]">
                      <Lock className="h-3 w-3" /> Dana masih ditahan
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </section>

        {/* ── Detail sengketa ── */}
        <section className="min-w-0">
          {!selectedId ? (
            <div className="grid h-full min-h-[300px] place-items-center rounded-2xl border border-dashed border-line bg-white text-center text-moss">
              <div>
                <Scale className="mx-auto h-10 w-10" aria-hidden="true" />
                <p className="mt-2 text-sm">Pilih sengketa untuk meninjau bukti dan memutuskan.</p>
              </div>
            </div>
          ) : detailLoading || !detail ? (
            <div className="grid h-full min-h-[300px] place-items-center rounded-2xl border border-line bg-white">
              <Spinner className="h-8 w-8 text-forest" />
            </div>
          ) : (
            <DetailSengketa detail={detail} onResolved={() => openDispute(selectedId)} />
          )}
        </section>
      </div>
    </div>
  );
};

const Stepper = ({ detail }) => {
  const steps = [
    { key: "open", label: "Dilaporkan", at: detail.createdAt, Icon: AlertCircle },
    { key: "reviewing", label: "Ditinjau", at: detail.reviewedAt, sub: "Oleh Admin", Icon: Clock },
    { key: "resolved", label: "Selesai", at: detail.resolvedAt, sub: "Menunggu keputusan", Icon: CheckCircle2 },
  ];
  const activeIdx = detail.status === "resolved" ? 2 : detail.status === "reviewing" ? 1 : 0;
  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <div key={s.key} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center text-center">
            <span
              className={`grid h-9 w-9 place-items-center rounded-full ${
                i <= activeIdx ? "bg-forest text-white" : "bg-cloud text-moss"
              }`}
            >
              <s.Icon className="h-5 w-5" />
            </span>
            <span className={`mt-1 text-xs font-bold ${i <= activeIdx ? "text-forest" : "text-moss"}`}>
              {s.label}
            </span>
            <span className="text-[10px] text-moss">{s.at ? tglJam(s.at) : s.sub}</span>
          </div>
          {i < steps.length - 1 && (
            <span className={`mx-2 h-0.5 flex-1 ${i < activeIdx ? "bg-forest" : "bg-line"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const RESOLUTIONS = [
  { key: "release", Icon: HandCoins, label: "Lepas dana ke mitra", desc: (a) => `Dana ${a} akan dilepas ke saldo mitra.` },
  { key: "refund", Icon: Undo2, label: "Refund ke pelanggan", desc: (a) => `Dana ${a} akan dikembalikan ke pelanggan.` },
  { key: "split", Icon: Split, label: "Split (Bagi dana)", desc: () => "Bagi dana antara pelanggan dan mitra." },
];

const DetailSengketa = ({ detail, onResolved }) => {
  const [tab, setTab] = useState("customer");
  const [resolution, setResolution] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const resolved = detail.status === "resolved";
  const amount = rupiahFull(detail.amount);

  const submit = async () => {
    if (!resolution) return toast.error("Pilih tindakan resolusi");
    if (!note.trim()) return toast.error("Catatan admin wajib diisi");
    setBusy(true);
    try {
      const r = await adminApi.patch(`/admin/disputes/${detail.id}/resolve`, {
        resolution,
        adminNote: note.trim(),
      });
      toast.success(r.data.message || "Keputusan tersimpan");
      onResolved();
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal menyimpan keputusan");
    } finally {
      setBusy(false);
    }
  };

  const evidence = tab === "customer" ? detail.evidenceCustomer : detail.evidenceWorker;

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-white p-5">
      <Stepper detail={detail} />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-ink">#{detail.code}</span>
          <StatusBadge status={detail.status} />
          <span className="text-sm text-moss">Dilaporkan {timeAgo(detail.createdAt)}</span>
        </div>
        {detail.transactionCode && (
          <span className="flex items-center gap-1 text-sm text-moss">
            Transaksi: <span className="font-semibold text-ink">{detail.transactionCode}</span>
            <Copy className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Pihak & escrow */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PartyCard party={detail.customer} role="Pelanggan" />
        <div className="rounded-xl border border-line p-3">
          <p className="text-sm font-bold text-ink">{detail.jobTitle}</p>
          <p className="mt-1 text-xs text-moss">{tglJam(detail.createdAt)}</p>
          {detail.area && <p className="text-xs text-moss">{detail.area}</p>}
        </div>
        <PartyCard party={detail.worker} role="Mitra" />
        <div className="rounded-xl border border-line bg-paper p-3">
          <p className="text-xs text-moss">Dana ditahan (Escrow)</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{amount}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#8a6a00]">
            <Lock className="h-3 w-3" /> {resolved ? "Sudah diputuskan" : "Dana masih ditahan"}
          </p>
        </div>
      </div>

      {detail.reason && (
        <div className="rounded-xl bg-paper p-3 text-sm">
          <span className="font-bold text-ink">Alasan: </span>
          <span className="text-moss">{detail.reason}</span>
          {detail.description && <p className="mt-1 text-moss">{detail.description}</p>}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Percakapan bukti */}
        <div>
          <h3 className="text-sm font-extrabold text-ink">Percakapan (Bukti)</h3>
          <div className="mt-2 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-line p-3">
            {detail.chat.filter((m) => m.type === "text").length === 0 ? (
              <p className="text-sm text-moss">Belum ada percakapan.</p>
            ) : (
              detail.chat
                .filter((m) => m.type === "text")
                .map((m) => (
                  <div key={m.id} className="flex gap-2">
                    <Avatar src={m.avatar} name={m.name} className="h-7 w-7 shrink-0" textClass="text-[10px]" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink">
                        {m.name} <span className="font-normal text-moss">{tglJam(m.at)}</span>
                      </p>
                      <p className="rounded-lg bg-paper px-2.5 py-1.5 text-sm text-ink">{m.body}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Bukti foto */}
        <div>
          <div className="flex items-center gap-3 text-sm font-bold">
            <button
              onClick={() => setTab("customer")}
              className={`border-b-2 pb-1 ${tab === "customer" ? "border-forest text-forest" : "border-transparent text-moss"}`}
            >
              Dari Pelanggan ({detail.evidenceCustomer.length})
            </button>
            <button
              onClick={() => setTab("worker")}
              className={`border-b-2 pb-1 ${tab === "worker" ? "border-forest text-forest" : "border-transparent text-moss"}`}
            >
              Dari Mitra ({detail.evidenceWorker.length})
            </button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {evidence.length === 0 ? (
              <p className="col-span-3 py-6 text-center text-sm text-moss">Tidak ada foto.</p>
            ) : (
              evidence.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="" className="h-24 w-full rounded-lg border border-line object-cover" />
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tindakan resolusi */}
      <div className="rounded-xl border border-line p-4">
        <h3 className="text-sm font-extrabold text-ink">Tindakan Resolusi</h3>
        {resolved ? (
          <div className="mt-2 rounded-lg bg-limesoft/40 p-3 text-sm">
            <p className="font-bold text-forest">
              {RESOLUTIONS.find((r) => r.key === detail.resolution)?.label ?? "Selesai"}
            </p>
            {detail.adminNote && <p className="mt-1 text-moss">{detail.adminNote}</p>}
          </div>
        ) : (
          <>
            <p className="mt-1 text-xs text-moss">
              Pilih tindakan yang sesuai setelah meninjau semua bukti dan percakapan.
            </p>
            <div className="mt-3 space-y-2">
              {RESOLUTIONS.map((r) => (
                <label
                  key={r.key}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    resolution === r.key ? "border-forest bg-limesoft/20" : "border-line hover:border-forest/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    checked={resolution === r.key}
                    onChange={() => setResolution(r.key)}
                    className="mt-1"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                      <r.Icon className="h-4 w-4 text-forest" /> {r.label}
                    </span>
                    <span className="text-xs text-moss">{r.desc(amount)}</span>
                  </span>
                </label>
              ))}
            </div>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-sm font-bold text-ink">Catatan Admin (wajib)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tuliskan alasan keputusan Anda..."
                className="ring-focus h-20 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:outline-none"
              />
            </label>
            <button
              onClick={submit}
              disabled={busy}
              className="ring-focus mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
            >
              {busy && <Spinner />}
              {busy ? "Menyimpan…" : "Simpan Keputusan"}
            </button>
          </>
        )}
      </div>

      {/* Riwayat status */}
      <div>
        <h3 className="text-sm font-extrabold text-ink">Riwayat Status</h3>
        <ol className="mt-3 space-y-3">
          {detail.history.map((h) => (
            <li key={h.key} className="flex gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${h.at ? "bg-forest" : "bg-line"}`}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">
                  {h.label} <span className="font-normal text-moss">{h.at ? tglJam(h.at) : ""}</span>
                </p>
                <p className="text-xs text-moss">{h.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

const PartyCard = ({ party, role }) => (
  <div className="rounded-xl border border-line p-3">
    <div className="flex items-center gap-2">
      <Avatar src={party?.avatar} name={party?.name} className="h-9 w-9" textClass="text-xs" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink">{party?.name ?? "-"}</p>
        <p className="text-xs text-moss">{role}</p>
      </div>
    </div>
    <p className="mt-2 truncate text-xs text-moss">{party?.email ?? "-"}</p>
    <p className="text-xs text-moss">{party?.phone ?? "-"}</p>
  </div>
);

export default AdminSengketa;
