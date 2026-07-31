import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  MapPin,
  Check,
  X,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { adminApi } from "../../lib/adminApi";
import Spinner from "../../components/Spinner";
import Avatar from "../../components/Avatar";

const rejectReasons = [
  "Foto verifikasi tidak jelas",
  "Data tidak lengkap",
  "Referensi tidak dapat dihubungi",
  "Identitas tidak sesuai",
  "Tarif/keahlian tidak wajar",
];

const timeAgo = (iso) => {
  if (!iso) return "-";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
};
const usia = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
  return a;
};
const tglLahir = (dob) =>
  dob ? new Date(dob).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";
const tarif = (a) =>
  a?.fixedRate ? `Rp${a.fixedRate}${a.rateMax ? `–${a.rateMax}` : ""}rb/jam` : "-";

const InfoRow = ({ label, value }) => (
  <div className="flex gap-3 py-1 text-sm">
    <span className="w-28 shrink-0 text-moss">{label}</span>
    <span className="font-medium text-ink">{value ?? "-"}</span>
  </div>
);

const AdminVerifikasi = () => {
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const loadList = async () => {
    const { data } = await adminApi.get("/admin/worker-applications?status=submitted");
    setList(data.data);
    return data.data;
  };

  useEffect(() => {
    loadList()
      .then((items) => setSelectedId(items[0]?.id ?? null))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    adminApi
      .get(`/admin/worker-applications/${selectedId}`)
      .then(({ data }) => setDetail(data.data.application))
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  const afterAction = async () => {
    setReason("");
    const items = await loadList();
    setSelectedId(items[0]?.id ?? null);
  };

  const approve = async () => {
    setBusy(true);
    try {
      await adminApi.patch(`/admin/worker-applications/${selectedId}/approve`);
      toast.success("Mitra disetujui");
      await afterAction();
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal menyetujui");
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!reason) {
      toast.error("Pilih alasan penolakan dulu");
      return;
    }
    setBusy(true);
    try {
      await adminApi.patch(`/admin/worker-applications/${selectedId}/reject`, { reason });
      toast.success("Pendaftaran ditolak");
      await afterAction();
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal menolak");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Verifikasi Mitra</h1>
        <p className="mt-1 text-sm text-moss">Tinjau dan proses pendaftaran mitra baru.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
        {/* Antrean */}
        <aside className="rounded-2xl border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-extrabold text-ink">
              Menunggu verifikasi{" "}
              <span className="text-moss">({list.length})</span>
            </h2>
          </div>
          {loadingList ? (
            <div className="grid place-items-center py-16">
              <Spinner className="h-7 w-7 text-forest" />
            </div>
          ) : list.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <Inbox className="h-8 w-8 text-moss" aria-hidden="true" />
              <p className="mt-2 text-sm text-moss">Tidak ada antrean.</p>
            </div>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-line overflow-y-auto">
              {list.map((w) => {
                const active = w.id === selectedId;
                return (
                  <li key={w.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(w.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        active ? "bg-limesoft/40" : "hover:bg-cloud"
                      }`}
                    >
                      <Avatar
                        src={w.avatarUrl}
                        name={w.fullName || w.name}
                        className="h-12 w-12 shrink-0"
                        square
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-bold text-ink">{w.name}</p>
                          <span className="shrink-0 text-xs text-moss">{timeAgo(w.submittedAt)}</span>
                        </div>
                        <p className="truncate text-sm text-moss">{w.category}</p>
                        <div className="mt-0.5 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-moss">
                            <MapPin className="h-3.5 w-3.5 text-forest" aria-hidden="true" />
                            {w.area || "-"}
                          </span>
                          <span className="rounded-full bg-sun/20 px-2 py-0.5 text-[11px] font-bold text-[#8a6a00]">
                            Menunggu
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 ${active ? "text-forest" : "text-line"}`}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Detail */}
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          {loadingDetail ? (
            <div className="grid place-items-center py-24">
              <Spinner className="h-8 w-8 text-forest" />
            </div>
          ) : !detail ? (
            <div className="grid place-items-center py-24 text-center">
              <ShieldCheck className="h-10 w-10 text-moss" aria-hidden="true" />
              <p className="mt-3 font-bold text-ink">Tidak ada pendaftaran dipilih</p>
              <p className="mt-1 text-sm text-moss">Pilih mitra di antrean untuk meninjau.</p>
            </div>
          ) : (
            <div>
              {/* Foto + identitas */}
              <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
                <div className="relative">
                  <span className="absolute left-2 top-2 rounded-lg bg-black/50 px-2 py-1 text-xs font-semibold text-white">
                    Foto verifikasi
                  </span>
                  {detail.selfiePhotoUrl || detail.profilePhotoUrl ? (
                    <img
                      src={detail.selfiePhotoUrl || detail.profilePhotoUrl}
                      alt=""
                      className="aspect-[4/5] w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[4/5] w-full place-items-center rounded-xl border border-dashed border-line bg-paper text-center text-sm text-moss">
                      Belum ada foto verifikasi
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
                    {detail.profile?.fullName}
                    <BadgeCheck className="h-6 w-6 fill-forest text-white" aria-hidden="true" />
                  </h2>
                  <p className="mt-0.5 text-moss">
                    {detail.category?.name}
                    {detail.serviceAreas?.[0] ? ` · ${detail.serviceAreas[0]}` : ""}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-moss">Diajukan</p>
                      <p className="font-semibold text-ink">
                        {new Date(detail.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-moss">ID Pendaftaran</p>
                      <p className="font-semibold text-ink">#{detail.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail data */}
              <div className="mt-6 grid gap-6 border-t border-line pt-6 lg:grid-cols-3">
                <div>
                  <h3 className="mb-2 font-bold text-ink">Profil Mitra</h3>
                  <InfoRow label="Nama Lengkap" value={detail.profile?.fullName} />
                  <InfoRow
                    label="Tanggal Lahir"
                    value={
                      detail.dateOfBirth
                        ? `${tglLahir(detail.dateOfBirth)} (${usia(detail.dateOfBirth)} thn)`
                        : "-"
                    }
                  />
                  <InfoRow label="Nomor Telepon" value={detail.profile?.phone} />
                  <InfoRow
                    label="Pengalaman"
                    value={detail.experienceYears != null ? `${detail.experienceYears} tahun` : "-"}
                  />
                  {detail.skillDescription && (
                    <div className="mt-2 text-sm">
                      <p className="text-moss">Tentang Saya</p>
                      <p className="mt-0.5 text-ink">{detail.skillDescription}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 font-bold text-ink">Keahlian</h3>
                  <ul className="space-y-1.5 text-sm">
                    {(detail.skills || []).length > 0 ? (
                      detail.skills.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-ink">
                          <Check className="h-4 w-4 text-forest" aria-hidden="true" />
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="text-moss">-</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-bold text-ink">Tarif</h3>
                  <p className="font-extrabold text-forest">{tarif(detail)}</p>
                  <h3 className="mb-2 mt-4 font-bold text-ink">Area Kerja</h3>
                  <div className="flex flex-wrap gap-2">
                    {(detail.serviceAreas || []).length > 0 ? (
                      detail.serviceAreas.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-ink"
                        >
                          <MapPin className="h-3 w-3 text-forest" aria-hidden="true" />
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-moss">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Referensi */}
              <div className="mt-6 rounded-xl border border-line p-4">
                <h3 className="font-bold text-ink">Referensi dari Komunitas</h3>
                {(detail.references || []).length > 0 ? (
                  <div className="mt-3 space-y-4">
                    {detail.references.map((r) => (
                      <ReferenceRow key={r.id} r={r} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-moss">Tidak ada referensi.</p>
                )}
              </div>

              {/* Aksi */}
              <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={approve}
                  disabled={busy}
                  className="ring-focus inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-6 text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-60"
                >
                  {busy ? <Spinner /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                  Setujui Mitra
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="ring-focus h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink focus:outline-none"
                  >
                    <option value="">Alasan penolakan...</option>
                    {rejectReasons.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={reject}
                    disabled={busy}
                    className="ring-focus inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-300 px-5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// Baris referensi dengan "tandai sudah dihubungi" + catatan (tersimpan ke backend).
const ReferenceRow = ({ r }) => {
  const [contacted, setContacted] = useState(r.contacted);
  const [note, setNote] = useState(r.adminNote || "");

  const save = async (patch) => {
    try {
      await adminApi.patch(`/admin/references/${r.id}`, patch);
    } catch {
      toast.error("Gagal menyimpan catatan referensi");
    }
  };

  return (
    <div className="rounded-lg bg-cloud/50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink">
            {r.name} <span className="font-normal text-moss">({r.relationship})</span>
          </p>
          <p className="text-sm text-moss">{r.phone}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={contacted}
            onChange={(e) => {
              setContacted(e.target.checked);
              save({ contacted: e.target.checked });
            }}
          />
          Sudah dihubungi
        </label>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => note !== (r.adminNote || "") && save({ adminNote: note })}
        placeholder="Catatan hasil konfirmasi referensi..."
        className="ring-focus mt-2 h-16 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:outline-none"
      />
    </div>
  );
};

export default AdminVerifikasi;
