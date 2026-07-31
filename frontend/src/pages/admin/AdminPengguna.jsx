import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  PauseCircle,
  Ban,
  CheckCircle2,
  Star,
  ShieldCheck,
  BadgeCheck,
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import Avatar from "../../components/Avatar";
import Spinner from "../../components/Spinner";

const STATUS = {
  active: { label: "Aktif", cls: "bg-limesoft text-forest" },
  suspended: { label: "Ditangguhkan", cls: "bg-sun/20 text-[#8a6a00]" },
  blocked: { label: "Diblokir", cls: "bg-red-50 text-red-600" },
};

const tgl = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "-";

const rupiahFull = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
const rupiahCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e9) return "Rp" + (v / 1e9).toFixed(1).replace(".", ",") + "M";
  if (v >= 1e6) return "Rp" + (v / 1e6).toFixed(1).replace(".", ",") + "jt";
  if (v >= 1e3) return "Rp" + Math.round(v / 1e3) + "rb";
  return "Rp" + v;
};

const PAGE_SIZE = 10;

const StatusBadge = ({ status }) => {
  const s = STATUS[status] ?? STATUS.active;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
};

const AdminPengguna = () => {
  const [tab, setTab] = useState("mitra");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = (t) => {
    setLoading(true);
    adminApi
      .get(`/admin/users?tab=${t}`)
      .then((r) => setRows(r.data.data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(tab);
    setPage(1);
    setSelectedId(null);
    setDetail(null);
    setQ("");
    setStatusFilter("");
    setCategoryFilter("");
    setAreaFilter("");
  }, [tab]);

  const categories = useMemo(
    () => [...new Set(rows.map((r) => r.category).filter(Boolean))],
    [rows],
  );
  const areas = useMemo(
    () => [...new Set(rows.map((r) => r.area).filter(Boolean))],
    [rows],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (term && !`${r.name} ${r.phone ?? ""} ${r.idMitra ?? ""} ${r.email ?? ""}`.toLowerCase().includes(term))
        return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (areaFilter && r.area !== areaFilter) return false;
      return true;
    });
  }, [rows, q, statusFilter, categoryFilter, areaFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openDetail = (row) => {
    if (tab !== "mitra") return; // panel detail kaya khusus mitra
    setSelectedId(row.id);
    setDetail(null);
    setDetailLoading(true);
    adminApi
      .get(`/admin/users/${row.id}/detail`)
      .then((r) => setDetail(r.data.data.user))
      .catch(() => toast.error("Gagal memuat detail"))
      .finally(() => setDetailLoading(false));
  };

  const changeStatus = async (profileId, status, label) => {
    try {
      await adminApi.patch(`/admin/users/${profileId}/status`, { status });
      setRows((prev) => prev.map((r) => (r.profileId === profileId ? { ...r, status } : r)));
      setDetail((d) => (d && d.profileId === profileId ? { ...d, status } : d));
      toast.success(label);
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Pengguna</h1>
        <p className="mt-1 text-sm text-moss">Kelola pelanggan dan mitra di platform Torano</p>
      </header>

      {/* Tab Pelanggan / Mitra */}
      <div className="mt-5 inline-flex rounded-xl border border-line bg-white p-1">
        {[
          ["pelanggan", "Pelanggan"],
          ["mitra", "Mitra"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-5 py-2 text-sm font-bold transition-colors ${
              tab === key ? "bg-forest text-white" : "text-moss hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_auto]">
        {/* ── Panel tabel ── */}
        <section className="min-w-0 rounded-2xl border border-line bg-white p-4 sm:p-5">
          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-paper px-3">
              <Search className="h-4 w-4 text-moss" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama, telepon, atau ID..."
                className="h-10 w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            {tab === "mitra" && (
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:outline-none"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
            <select
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:outline-none"
            >
              <option value="">Semua Area</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:outline-none"
            >
              <option value="">Status: Semua</option>
              <option value="active">Aktif</option>
              <option value="suspended">Ditangguhkan</option>
              <option value="blocked">Diblokir</option>
            </select>
            <span className="flex h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-semibold text-moss">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filter
            </span>
          </div>

          {/* Tabel */}
          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <div className="grid place-items-center py-20">
                <Spinner className="h-8 w-8 text-forest" />
              </div>
            ) : pageRows.length === 0 ? (
              <div className="grid place-items-center py-20 text-sm text-moss">
                Tidak ada data.
              </div>
            ) : (
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-moss">
                    <th className="py-3 pr-3 font-bold">{tab === "mitra" ? "Mitra" : "Pelanggan"}</th>
                    <th className="px-3 py-3 font-bold">Telepon</th>
                    {tab === "mitra" && <th className="px-3 py-3 font-bold">Area</th>}
                    <th className="px-3 py-3 font-bold">Bergabung</th>
                    {tab === "mitra" && <th className="px-3 py-3 font-bold">Pekerjaan</th>}
                    {tab === "mitra" && <th className="px-3 py-3 font-bold">Rating</th>}
                    <th className="px-3 py-3 font-bold">Status</th>
                    <th className="py-3 pl-3" />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => openDetail(r)}
                      className={`border-b border-line/70 transition-colors ${
                        tab === "mitra" ? "cursor-pointer" : ""
                      } ${selectedId === r.id ? "bg-limesoft/30" : "hover:bg-cloud/60"}`}
                    >
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={r.avatar} name={r.name} className="h-10 w-10" />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-ink">{r.name}</p>
                            <p className="truncate text-xs text-moss">
                              {tab === "mitra" ? r.category : r.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-moss">{r.phone ?? "-"}</td>
                      {tab === "mitra" && <td className="px-3 py-3 text-moss">{r.area ?? "-"}</td>}
                      <td className="px-3 py-3 text-moss">{tgl(r.joined)}</td>
                      {tab === "mitra" && <td className="px-3 py-3 text-moss">{r.jobs ?? 0}</td>}
                      {tab === "mitra" && (
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-ink">
                            <Star className="h-4 w-4 fill-sun text-sun" aria-hidden="true" />
                            {r.rating ?? "-"}
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 pl-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <RowMenu row={r} tab={tab} onDetail={() => openDetail(r)} onStatus={changeStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer pagination */}
          {!loading && filtered.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-moss">
                Menampilkan {(page - 1) * PAGE_SIZE + 1}
                {"–"}
                {Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}{" "}
                {tab === "mitra" ? "mitra" : "pelanggan"}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line text-moss disabled:opacity-40 hover:enabled:bg-cloud"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .map((n, i, arr) => (
                    <span key={n} className="flex items-center">
                      {i > 0 && arr[i - 1] !== n - 1 && <span className="px-1 text-moss">…</span>}
                      <button
                        onClick={() => setPage(n)}
                        className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm font-semibold ${
                          n === page ? "bg-forest text-white" : "border border-line text-ink hover:bg-cloud"
                        }`}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line text-moss disabled:opacity-40 hover:enabled:bg-cloud"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Panel detail (mitra) ── */}
        {selectedId && tab === "mitra" && (
          <DetailPanel
            detail={detail}
            loading={detailLoading}
            onClose={() => {
              setSelectedId(null);
              setDetail(null);
            }}
            onStatus={changeStatus}
          />
        )}
      </div>
    </div>
  );
};

// Menu aksi "..." per baris.
const RowMenu = ({ row, tab, onDetail, onStatus }) => (
  <details className="group relative inline-block text-left">
    <summary className="ring-focus grid h-8 w-8 cursor-pointer list-none place-items-center rounded-lg text-moss hover:bg-cloud hover:text-ink">
      <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
    </summary>
    <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0_20px_50px_-20px_rgba(13,59,46,0.4)]">
      {tab === "mitra" && (
        <button
          onClick={onDetail}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink hover:bg-cloud"
        >
          <Eye className="h-4 w-4" /> Lihat Detail
        </button>
      )}
      {row.status !== "suspended" ? (
        <button
          onClick={() => onStatus(row.profileId, "suspended", "Akun ditangguhkan")}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#8a6a00] hover:bg-sun/10"
        >
          <PauseCircle className="h-4 w-4" /> Tangguhkan
        </button>
      ) : (
        <button
          onClick={() => onStatus(row.profileId, "active", "Akun diaktifkan")}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-forest hover:bg-limesoft/40"
        >
          <CheckCircle2 className="h-4 w-4" /> Aktifkan
        </button>
      )}
      {row.status !== "blocked" ? (
        <button
          onClick={() => onStatus(row.profileId, "blocked", "Akun diblokir")}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        >
          <Ban className="h-4 w-4" /> Blokir
        </button>
      ) : (
        <button
          onClick={() => onStatus(row.profileId, "active", "Blokir dibuka")}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-forest hover:bg-limesoft/40"
        >
          <CheckCircle2 className="h-4 w-4" /> Buka Blokir
        </button>
      )}
    </div>
  </details>
);

const Stars = ({ value }) => (
  <span className="inline-flex">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i <= Math.round(value || 0) ? "fill-sun text-sun" : "fill-line text-line"}`}
      />
    ))}
  </span>
);

const DetailPanel = ({ detail, loading, onClose, onStatus }) => {
  const copyId = () => {
    if (detail?.idMitra) {
      navigator.clipboard?.writeText(detail.idMitra);
      toast.success("ID mitra disalin");
    }
  };

  return (
    <aside className="w-full rounded-2xl border border-line bg-white p-5 xl:w-[380px]">
      {loading || !detail ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8 text-forest" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Avatar src={detail.avatar} name={detail.name} className="h-16 w-16" square textClass="text-xl" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-ink">{detail.name}</h2>
                  <StatusBadge status={detail.status} />
                </div>
                <p className="mt-0.5 text-sm text-moss">
                  {detail.category}
                  {detail.area ? ` · ${detail.area}` : ""}
                </p>
                <p className="mt-1 text-sm text-moss">{detail.phone ?? "-"}</p>
                <p className="text-sm text-moss">{detail.email ?? "-"}</p>
                <button
                  onClick={copyId}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline"
                >
                  ID Mitra: {detail.idMitra}
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="rounded-lg p-1 text-moss hover:bg-cloud hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Verifikasi & Keamanan */}
          <div className="rounded-xl border border-line p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-ink">Verifikasi & Keamanan</h3>
              {detail.verification === "verified" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-limesoft px-2 py-0.5 text-[11px] font-bold text-forest">
                  <BadgeCheck className="h-3.5 w-3.5" /> Terverifikasi
                </span>
              )}
            </div>
            <ul className="mt-3 space-y-2.5">
              {detail.checklist.map((c) => (
                <li key={c.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <CheckCircle2
                      className={`h-4 w-4 ${c.done ? "text-forest" : "text-line"}`}
                    />
                    {c.label}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={c.done ? "font-semibold text-forest" : "text-moss"}>
                      {c.done ? "Terverifikasi" : "Belum"}
                    </span>
                    <span className="hidden text-xs text-moss sm:inline">{tgl(c.at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: detail.stats.jobsCompleted ?? 0, l: "Pekerjaan selesai" },
              { v: detail.stats.rating ?? "-", l: "Rating rata-rata", star: true },
              {
                v: detail.stats.completionRate != null ? `${detail.stats.completionRate}%` : "-",
                l: "Tingkat penyelesaian",
              },
              { v: rupiahCompact(detail.stats.totalEarned), l: "Total pendapatan" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-paper p-3 text-center">
                <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-ink">
                  {s.star && <Star className="h-4 w-4 fill-sun text-sun" />}
                  {s.v}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-moss">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Pekerjaan terbaru */}
          <div>
            <h3 className="text-sm font-extrabold text-ink">Pekerjaan terbaru</h3>
            {detail.recentJobs.length === 0 ? (
              <p className="mt-2 text-sm text-moss">Belum ada pekerjaan.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {detail.recentJobs.map((j) => (
                  <li key={j.id} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{j.title}</p>
                      <p className="text-xs text-moss">{tgl(j.date)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-ink">{rupiahFull(j.price)}</p>
                      <p className="text-[11px] capitalize text-forest">{j.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Ulasan terbaru */}
          {detail.recentReviews.length > 0 && (
            <div>
              <h3 className="text-sm font-extrabold text-ink">Ulasan terbaru</h3>
              <ul className="mt-2 space-y-2">
                {detail.recentReviews.map((r) => (
                  <li key={r.id} className="rounded-xl bg-paper p-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Avatar src={r.avatar} name={r.name} className="h-7 w-7" textClass="text-[10px]" />
                        <span className="text-sm font-bold text-ink">{r.name}</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-ink">
                        <Stars value={r.rating} /> {Number(r.rating).toFixed(1)}
                      </span>
                    </div>
                    {r.comment && <p className="mt-1.5 text-sm text-moss">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Aktivitas akun */}
          <div>
            <h3 className="text-sm font-extrabold text-ink">Aktivitas akun</h3>
            <ol className="mt-3 space-y-3">
              {detail.activity.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-forest" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{a.title}</p>
                    {a.sub && <p className="text-xs text-moss">{a.sub}</p>}
                  </div>
                  <span className="shrink-0 text-[11px] text-moss">{tgl(a.at)}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Aksi moderasi cepat */}
          <div className="flex gap-2 border-t border-line pt-4">
            {detail.status !== "suspended" ? (
              <button
                onClick={() => onStatus(detail.profileId, "suspended", "Akun ditangguhkan")}
                className="flex-1 rounded-xl border border-sun/50 bg-sun/10 py-2.5 text-sm font-bold text-[#8a6a00] hover:bg-sun/20"
              >
                Tangguhkan
              </button>
            ) : (
              <button
                onClick={() => onStatus(detail.profileId, "active", "Akun diaktifkan")}
                className="flex-1 rounded-xl border border-forest bg-limesoft/40 py-2.5 text-sm font-bold text-forest hover:bg-limesoft/60"
              >
                Aktifkan
              </button>
            )}
            {detail.status !== "blocked" ? (
              <button
                onClick={() => onStatus(detail.profileId, "blocked", "Akun diblokir")}
                className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
              >
                Blokir
              </button>
            ) : (
              <button
                onClick={() => onStatus(detail.profileId, "active", "Blokir dibuka")}
                className="flex-1 rounded-xl border border-forest bg-limesoft/40 py-2.5 text-sm font-bold text-forest hover:bg-limesoft/60"
              >
                Buka Blokir
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default AdminPengguna;
