import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Camera,
  BadgeCheck,
  Star,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Tag,
  MapPin,
  Images,
  Landmark,
  Clock,
  Pencil,
  Plus,
  Trash2,
  Send,
  Phone,
  UserRound,
  Cake,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import ImageUpload from "../../components/ImageUpload";
import LocationPicker from "../../components/LocationPicker";

const rb = (n) => (n == null || n === "" ? "-" : `Rp${n}rb`);
const DAYS = [
  ["sen", "Sen"],
  ["sel", "Sel"],
  ["rab", "Rab"],
  ["kam", "Kam"],
  ["jum", "Jum"],
  ["sab", "Sab"],
  ["min", "Min"],
];

const STATUS = {
  draft: { label: "Belum dikirim", cls: "bg-cloud text-moss" },
  submitted: { label: "Menunggu verifikasi", cls: "bg-sun/20 text-[#8a6a00]" },
  verified: { label: "Terverifikasi", cls: "bg-limesoft text-forest" },
  rejected: { label: "Ditolak", cls: "bg-red-50 text-red-600" },
};

// Kartu section dengan tombol Edit di kanan atas (mengikuti mockup).
const SectionCard = ({ icon: Icon, title, onEdit, addLabel, children }) => (
  <section className="rounded-2xl border border-line bg-white p-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-limesoft text-forest">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="font-extrabold text-ink">{title}</h2>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="ring-focus inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-forest hover:bg-limesoft/50"
        >
          {addLabel ? <Plus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {addLabel || "Edit"}
        </button>
      )}
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

// Input tag/chip sederhana (untuk keahlian & area).
const TagInput = ({ value, onChange, placeholder }) => {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setText("");
  };
  return (
    <div>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-limesoft px-3 py-1 text-sm font-semibold text-forest"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== v))}
                aria-label={`Hapus ${v}`}
                className="text-forest/70 hover:text-forest"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          placeholder={placeholder}
          className="ring-focus h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-xl border border-line px-3 text-sm font-bold text-forest hover:bg-limesoft/50"
        >
          Tambah
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-bold text-ink">{label}</span>
    {children}
  </label>
);

const inputCls =
  "ring-focus h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink focus:outline-none";

const SaveBtn = ({ busy, label = "Simpan" }) => (
  <button
    type="submit"
    disabled={busy}
    className="ring-focus flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
  >
    {busy && <Spinner />}
    {busy ? "Menyimpan..." : label}
  </button>
);

const ProfilSaya = () => {
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { refresh } = useAuth();

  const load = () =>
    api.get("/worker/me").then((r) => setData(r.data.data));

  useEffect(() => {
    Promise.all([
      load(),
      api.get("/categories").then((r) => setCats(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const app = data?.application;
  const profile = data?.profile;
  const close = () => setModal(null);

  const patchApp = async (patch, msg = "Tersimpan") => {
    try {
      await api.patch("/worker/me/application", patch);
      await load();
      toast.success(msg);
      return true;
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal menyimpan, coba lagi");
      return false;
    }
  };
  const saveApp = async (patch) => {
    const ok = await patchApp(patch);
    if (ok) close();
  };

  // Simpan biodata: nama/telepon ke profil, tanggal lahir ke aplikasi pekerja.
  const saveBiodata = async ({ fullName, phone, dateOfBirth }) => {
    try {
      await api.patch("/auth/profile", { fullName, phone });
      if (dateOfBirth !== undefined) {
        await api.patch("/worker/me/application", { dateOfBirth });
      }
      await load();
      await refresh();
      toast.success("Biodata diperbarui");
      close();
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal menyimpan, coba lagi");
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post("/worker/me/application/submit");
      await load();
      toast.success("Terkirim untuk verifikasi");
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal mengirim");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-moss">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const status = STATUS[app?.status] ?? STATUS.draft;
  const photo = app?.profilePhotoUrl || profile?.avatarUrl || null;
  const dob = app?.dateOfBirth
    ? new Date(app.dateOfBirth).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const joined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : "-";
  const wh = app?.workingHours;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Banner status verifikasi */}
      {app?.status !== "verified" && (
        <div
          className={`mb-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
            app?.status === "rejected"
              ? "border-red-200 bg-red-50"
              : app?.status === "submitted"
                ? "border-sun/40 bg-sun/10"
                : "border-line bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
            <div>
              <p className="font-bold text-ink">
                {app?.status === "submitted"
                  ? "Data sedang ditinjau admin"
                  : app?.status === "rejected"
                    ? "Verifikasi ditolak"
                    : "Lengkapi data lalu kirim untuk verifikasi"}
              </p>
              <p className="text-sm text-moss">
                {app?.status === "submitted"
                  ? "Kamu bisa online setelah disetujui admin."
                  : app?.status === "rejected"
                    ? app?.rejectionReason || "Perbaiki data lalu kirim ulang."
                    : "Kategori, keahlian, tarif, area, foto, dan referensi wajib diisi."}
              </p>
            </div>
          </div>
          {app?.status !== "submitted" && (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="ring-focus flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold text-white transition-colors hover:bg-forest disabled:opacity-70"
            >
              {submitting ? <Spinner /> : <Send className="h-4 w-4" />}
              {app?.status === "rejected" ? "Kirim Ulang" : "Kirim untuk Verifikasi"}
            </button>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── Kartu profil (kiri) ── */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-line bg-white p-6 text-center">
            <div className="mx-auto w-fit">
              <ImageUpload
                variant="avatar"
                value={photo}
                name={profile?.fullName}
                folder="avatar"
                onChange={async (url) => {
                  await patchApp({ profilePhotoUrl: url }, "Foto diperbarui");
                  refresh();
                }}
              />
            </div>
            <h1 className="mt-3 text-xl font-extrabold text-ink">
              {profile?.fullName}
            </h1>
            {profile?.phone && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-moss">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {profile.phone}
              </p>
            )}
            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${status.cls}`}
            >
              {app?.status === "verified" && <BadgeCheck className="h-4 w-4" />}
              {status.label}
            </span>

            <dl className="mt-5 space-y-3 border-t border-line pt-5 text-left text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-moss">Bergabung</dt>
                <dd className="font-semibold text-ink">{joined}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-moss">
                  <Star className="h-4 w-4 text-sun" /> Penilaian
                </dt>
                <dd className="font-semibold text-ink">
                  {app?.ratingAvg ?? "-"}{" "}
                  <span className="font-normal text-moss">
                    ({app?.reviewCount ?? 0} ulasan)
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-moss">
                  <CheckCircle2 className="h-4 w-4 text-forest" /> Pekerjaan Selesai
                </dt>
                <dd className="font-semibold text-ink">{app?.jobsCompleted ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-moss">
                  <ShieldCheck className="h-4 w-4 text-forest" /> Tingkat Penyelesaian
                </dt>
                <dd className="font-semibold text-ink">
                  {app?.completionRate != null ? `${app.completionRate}%` : "-"}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* ── Section kanan ── */}
        <div className="space-y-4 lg:col-span-2">
          <SectionCard icon={UserRound} title="Biodata" onEdit={() => setModal("biodata")}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-moss">Nama lengkap</dt>
                <dd className="mt-0.5 font-semibold text-ink">{profile?.fullName || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-moss">Nomor telepon</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-ink">
                  <Phone className="h-4 w-4 text-forest" aria-hidden="true" />
                  {profile?.phone || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-moss">Tanggal lahir</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-ink">
                  <Cake className="h-4 w-4 text-forest" aria-hidden="true" />
                  {dob || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-moss">Email</dt>
                <dd className="mt-0.5 truncate font-semibold text-ink">{profile?.email || "-"}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard icon={Camera} title="Foto Verifikasi Wajah">
            <ImageUpload
              value={app?.selfiePhotoUrl}
              folder="verifikasi"
              hint="Foto wajah jelas dengan pencahayaan cukup untuk ditinjau admin"
              onChange={(url) => patchApp({ selfiePhotoUrl: url }, "Foto verifikasi diperbarui")}
            />
          </SectionCard>

          <SectionCard icon={Wrench} title="Kategori & Keahlian" onEdit={() => setModal("keahlian")}>
            {app?.category?.name ? (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-forest px-3 py-1 text-sm font-semibold text-white">
                  {app.category.name}
                </span>
                {(app?.skills || []).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-limesoft px-3 py-1 text-sm font-semibold text-forest"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-moss">Belum diisi.</p>
            )}
            {app?.skillDescription && (
              <p className="mt-3 text-sm text-moss">{app.skillDescription}</p>
            )}
          </SectionCard>

          <SectionCard icon={Tag} title="Tarif" onEdit={() => setModal("tarif")}>
            <p className="text-sm text-moss">Rentang tarif per jam</p>
            <p className="mt-1 text-xl font-extrabold text-forest">
              {rb(app?.fixedRate)} &ndash; {rb(app?.rateMax)}
              <span className="text-sm font-semibold text-moss"> /jam</span>
            </p>
          </SectionCard>

          <SectionCard icon={MapPin} title="Area Kerja" onEdit={() => setModal("area")}>
            {app?.latitude && app?.longitude ? (
              <LocationPicker
                lat={Number(app.latitude)}
                lng={Number(app.longitude)}
                radiusKm={app.radiusKm || 5}
                interactive={false}
                className="h-44 w-full"
              />
            ) : (
              <div className="rounded-xl border border-dashed border-line bg-paper p-4 text-sm text-moss">
                Titik lokasi belum ditandai. Klik Edit untuk menandai posisimu di peta.
              </div>
            )}
            <p className="mt-2 text-sm text-moss">
              Radius layanan:{" "}
              <span className="font-semibold text-ink">
                {app?.radiusKm ? `${app.radiusKm} km` : "-"}
              </span>
            </p>
            {(app?.serviceAreas || []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {app.serviceAreas.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-sm font-semibold text-ink"
                  >
                    <MapPin className="h-3.5 w-3.5 text-forest" />
                    {a}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={Images}
            title="Portofolio"
            onEdit={() => setModal("portfolio")}
            addLabel="Tambah"
          >
            {(app?.portfolios || []).length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {app.portfolios.map((p) => (
                  <div key={p.id} className="group relative">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="h-24 w-24 rounded-xl border border-line object-cover"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        await api.delete(`/worker/me/portfolios/${p.id}`);
                        load();
                      }}
                      className="absolute right-1 top-1 hidden rounded-lg bg-white/90 p-1 text-red-600 group-hover:block"
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-moss">Belum ada portofolio.</p>
            )}
          </SectionCard>

          <SectionCard
            icon={Landmark}
            title="Metode Pencairan Dana"
            onEdit={() => setModal("payout")}
            addLabel="Tambah"
          >
            {(app?.payoutAccounts || []).length > 0 ? (
              <ul className="space-y-2">
                {app.payoutAccounts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {a.provider}{" "}
                        <span className="font-normal text-moss">
                          &bull;&bull;&bull;{a.accountNumber.slice(-4)}
                        </span>
                        {a.isPrimary && (
                          <span className="ml-2 rounded-md bg-limesoft px-1.5 py-0.5 text-[11px] font-bold text-forest">
                            Utama
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-moss">a.n. {a.accountHolder}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.delete(`/worker/me/payout-accounts/${a.id}`);
                        load();
                      }}
                      className="rounded-lg p-1.5 text-moss hover:bg-red-50 hover:text-red-600"
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-moss">Belum ada rekening/e-wallet.</p>
            )}
          </SectionCard>

          <SectionCard icon={Clock} title="Jam Kerja" onEdit={() => setModal("jam")}>
            {wh?.days ? (
              <div className="flex flex-wrap items-center gap-2">
                {DAYS.map(([k, label]) => (
                  <span
                    key={k}
                    className={`grid h-9 w-11 place-items-center rounded-lg text-xs font-bold ${
                      wh.days[k]
                        ? "bg-forest text-white"
                        : "bg-cloud text-moss"
                    }`}
                  >
                    {label}
                  </span>
                ))}
                <span className="ml-1 text-sm font-semibold text-moss">
                  {wh.start} &ndash; {wh.end}
                </span>
              </div>
            ) : (
              <p className="text-sm text-moss">Belum diatur.</p>
            )}
          </SectionCard>

          <SectionCard
            icon={ShieldCheck}
            title="Referensi Komunitas"
            onEdit={() => setModal("referensi")}
            addLabel="Tambah"
          >
            {(app?.references || []).length > 0 ? (
              <ul className="space-y-2">
                {app.references.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">{r.name}</p>
                      <p className="text-xs text-moss">
                        {r.relationship} &middot; {r.phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.delete(`/worker/me/references/${r.id}`);
                        load();
                      }}
                      className="rounded-lg p-1.5 text-moss hover:bg-red-50 hover:text-red-600"
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-moss">Belum ada referensi.</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Modal edit ── */}
      <Modal open={modal === "biodata"} title="Ubah Biodata" onClose={close}>
        <BiodataForm profile={profile} app={app} onSave={saveBiodata} />
      </Modal>
      <Modal open={modal === "keahlian"} title="Kategori & Keahlian" onClose={close}>
        <KeahlianForm app={app} cats={cats} onSave={saveApp} />
      </Modal>
      <Modal open={modal === "tarif"} title="Tarif per Jam" onClose={close}>
        <TarifForm app={app} onSave={saveApp} />
      </Modal>
      <Modal open={modal === "area"} title="Area Kerja" onClose={close}>
        <AreaForm app={app} onSave={saveApp} />
      </Modal>
      <Modal open={modal === "jam"} title="Jam Kerja" onClose={close}>
        <JamForm app={app} onSave={saveApp} />
      </Modal>
      <Modal open={modal === "referensi"} title="Tambah Referensi" onClose={close}>
        <ReferensiForm
          onDone={async (body) => {
            await api.post("/worker/me/references", body);
            await load();
            toast.success("Referensi ditambahkan");
            close();
          }}
        />
      </Modal>
      <Modal open={modal === "payout"} title="Tambah Rekening / E-wallet" onClose={close}>
        <PayoutForm
          onDone={async (body) => {
            await api.post("/worker/me/payout-accounts", body);
            await load();
            toast.success("Metode pencairan ditambahkan");
            close();
          }}
        />
      </Modal>
      <Modal open={modal === "portfolio"} title="Tambah Portofolio" onClose={close}>
        <PortfolioForm
          onDone={async (body) => {
            await api.post("/worker/me/portfolios", body);
            await load();
            toast.success("Portofolio ditambahkan");
            close();
          }}
        />
      </Modal>
    </div>
  );
};

// ── Form modal ──
const useBusy = () => useState(false);

const BiodataForm = ({ profile, app, onSave }) => {
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [dob, setDob] = useState(app?.dateOfBirth ? app.dateOfBirth.slice(0, 10) : "");
  const [busy, setBusy] = useBusy();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth: dob || undefined,
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Nama lengkap">
        <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </Field>
      <Field label="Nomor telepon">
        <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="mis. 0812xxxxxxx" inputMode="tel" />
      </Field>
      <Field label="Tanggal lahir">
        <input type="date" className={inputCls} value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
      </Field>
      <SaveBtn busy={busy} />
    </form>
  );
};

const KeahlianForm = ({ app, cats, onSave }) => {
  const [categoryId, setCategoryId] = useState(app?.categoryId || app?.category?.id || "");
  const [skills, setSkills] = useState(app?.skills || []);
  const [desc, setDesc] = useState(app?.skillDescription || "");
  const [exp, setExp] = useState(
    app?.experienceYears != null ? String(app.experienceYears) : "",
  );
  const [busy, setBusy] = useBusy();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({
        categoryId: categoryId || undefined,
        skills,
        skillDescription: desc,
        experienceYears: exp === "" ? undefined : Number(exp),
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Kategori">
        <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="" disabled>Pilih kategori</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Keahlian spesifik">
        <TagInput value={skills} onChange={setSkills} placeholder="Ketik keahlian lalu tekan Tambah, mis. Pengecatan" />
      </Field>
      <Field label="Lama pengalaman">
        <select className={inputCls} value={exp} onChange={(e) => setExp(e.target.value)}>
          <option value="">Pilih lama pengalaman</option>
          <option value="0">Kurang dari 1 tahun</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((y) => (
            <option key={y} value={y}>
              {y} tahun
            </option>
          ))}
          <option value="11">Lebih dari 10 tahun</option>
        </select>
      </Field>
      <Field label="Tentang keahlianmu">
        <textarea
          className={`${inputCls} h-24 py-2`}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Ceritakan singkat pengalaman & jenis pekerjaan yang biasa kamu tangani."
        />
      </Field>
      <SaveBtn busy={busy} />
    </form>
  );
};

const TarifForm = ({ app, onSave }) => {
  const [min, setMin] = useState(app?.fixedRate || "");
  const [max, setMax] = useState(app?.rateMax || "");
  const [busy, setBusy] = useBusy();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({ fixedRate: Number(min), rateMax: max === "" ? undefined : Number(max) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm text-moss">Dalam ribuan rupiah (mis. 90 = Rp90.000).</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tarif minimum">
          <input type="number" min="0" className={inputCls} value={min} onChange={(e) => setMin(e.target.value)} required />
        </Field>
        <Field label="Tarif maksimum">
          <input type="number" min="0" className={inputCls} value={max} onChange={(e) => setMax(e.target.value)} />
        </Field>
      </div>
      <SaveBtn busy={busy} />
    </form>
  );
};

const AreaForm = ({ app, onSave }) => {
  const [lat, setLat] = useState(app?.latitude != null ? Number(app.latitude) : null);
  const [lng, setLng] = useState(app?.longitude != null ? Number(app.longitude) : null);
  const [radius, setRadius] = useState(app?.radiusKm || 5);
  const [areas, setAreas] = useState(app?.serviceAreas || []);
  const [busy, setBusy] = useBusy();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const patch = { serviceAreas: areas, radiusKm: radius };
      if (lat != null && lng != null) {
        patch.latitude = Number(lat.toFixed(6));
        patch.longitude = Number(lng.toFixed(6));
      }
      await onSave(patch);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Titik lokasimu">
        <LocationPicker
          lat={lat}
          lng={lng}
          radiusKm={radius}
          onChange={(la, ln) => {
            setLat(la);
            setLng(ln);
          }}
        />
        <p className="mt-1 text-xs text-moss">
          {lat == null
            ? "Ketuk peta untuk menandai lokasimu."
            : "Ketuk lokasi lain atau geser pin untuk mengubah."}
        </p>
      </Field>
      <Field label="Radius layanan">
        <select className={inputCls} value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
          {[3, 5, 10, 15, 20].map((r) => (
            <option key={r} value={r}>
              {r} km
            </option>
          ))}
        </select>
      </Field>
      <Field label="Nama area yang dilayani">
        <TagInput value={areas} onChange={setAreas} placeholder="mis. Wanea, tekan Tambah" />
      </Field>
      <SaveBtn busy={busy} />
    </form>
  );
};

const JamForm = ({ app, onSave }) => {
  const wh = app?.workingHours || {};
  const [days, setDays] = useState(
    wh.days || { sen: true, sel: true, rab: true, kam: true, jum: true, sab: false, min: false },
  );
  const [start, setStart] = useState(wh.start || "08:00");
  const [end, setEnd] = useState(wh.end || "17:00");
  const [busy, setBusy] = useBusy();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({ workingHours: { days, start, end } });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Hari kerja">
        <div className="flex flex-wrap gap-2">
          {DAYS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setDays((d) => ({ ...d, [k]: !d[k] }))}
              className={`h-10 w-12 rounded-lg text-sm font-bold ${
                days[k] ? "bg-forest text-white" : "bg-cloud text-moss"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mulai">
          <input type="time" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="Selesai">
          <input type="time" className={inputCls} value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>
      <SaveBtn busy={busy} />
    </form>
  );
};

const ReferensiForm = ({ onDone }) => {
  const [f, setF] = useState({ name: "", relationship: "", phone: "" });
  const [busy, setBusy] = useBusy();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onDone(f);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Nama"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
      <Field label="Hubungan (mis. Ketua RT 03)"><input className={inputCls} value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value })} required /></Field>
      <Field label="Nomor telepon"><input className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required /></Field>
      <SaveBtn busy={busy} label="Tambah Referensi" />
    </form>
  );
};

const PayoutForm = ({ onDone }) => {
  const [f, setF] = useState({ type: "bank", provider: "", accountNumber: "", accountHolder: "", isPrimary: false });
  const [busy, setBusy] = useBusy();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onDone(f);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Jenis">
        <select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          <option value="bank">Bank</option>
          <option value="ewallet">E-wallet</option>
        </select>
      </Field>
      <Field label={f.type === "bank" ? "Nama bank" : "Penyedia e-wallet"}>
        <input className={inputCls} value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} placeholder={f.type === "bank" ? "mis. BCA" : "mis. GoPay"} required />
      </Field>
      <Field label={f.type === "bank" ? "Nomor rekening" : "Nomor e-wallet"}>
        <input className={inputCls} value={f.accountNumber} onChange={(e) => setF({ ...f, accountNumber: e.target.value })} required />
      </Field>
      <Field label="Nama pemilik"><input className={inputCls} value={f.accountHolder} onChange={(e) => setF({ ...f, accountHolder: e.target.value })} required /></Field>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" checked={f.isPrimary} onChange={(e) => setF({ ...f, isPrimary: e.target.checked })} />
        Jadikan rekening utama
      </label>
      <SaveBtn busy={busy} label="Tambah" />
    </form>
  );
};

const PortfolioForm = ({ onDone }) => {
  const [f, setF] = useState({ imageUrl: "", title: "" });
  const [busy, setBusy] = useBusy();
  const submit = async (e) => {
    e.preventDefault();
    if (!f.imageUrl) {
      toast.error("Unggah gambar dulu");
      return;
    }
    setBusy(true);
    try {
      await onDone(f);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Gambar hasil kerja">
        <ImageUpload value={f.imageUrl} folder="portfolio" facing="environment" onChange={(url) => setF({ ...f, imageUrl: url })} />
      </Field>
      <Field label="Judul (opsional)"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="mis. Renovasi dapur" /></Field>
      <SaveBtn busy={busy} label="Tambah" />
    </form>
  );
};

export default ProfilSaya;
