import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  UserCog,
  Percent,
  ShieldCheck,
  Tags,
  KeyRound,
  LogOut,
} from "lucide-react";
import { api } from "../../lib/api";
import { adminApi, getAdminName, adminLogout } from "../../lib/adminApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import Spinner from "../../components/Spinner";

const inputCls =
  "ring-focus h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink focus:outline-none";

// Form ganti kata sandi admin (tersimpan di database).
const PasswordForm = () => {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (next.length < 8) return toast.error("Kata sandi baru minimal 8 karakter");
    if (next !== conf) return toast.error("Konfirmasi kata sandi tidak cocok");
    setBusy(true);
    try {
      await adminApi.patch("/admin/password", { currentPassword: cur, newPassword: next });
      toast.success("Kata sandi admin diperbarui");
      setCur("");
      setNext("");
      setConf("");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal mengubah kata sandi");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-ink">Kata sandi saat ini</span>
        <input type="password" className={inputCls} value={cur} onChange={(e) => setCur(e.target.value)} required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Kata sandi baru</span>
          <input type="password" className={inputCls} value={next} onChange={(e) => setNext(e.target.value)} placeholder="Minimal 8 karakter" required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Ulangi kata sandi baru</span>
          <input type="password" className={inputCls} value={conf} onChange={(e) => setConf(e.target.value)} required />
        </label>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="ring-focus flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
      >
        {busy && <Spinner />}
        {busy ? "Menyimpan…" : "Simpan Kata Sandi Baru"}
      </button>
    </form>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <section className="rounded-2xl border border-line bg-white p-5">
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-limesoft text-forest">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="font-extrabold text-ink">{title}</h2>
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-line/60 py-2.5 last:border-0">
    <dt className="text-sm text-moss">{label}</dt>
    <dd className="text-sm font-bold text-ink">{value}</dd>
  </div>
);

const AdminPengaturan = () => {
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [confirmOut, setConfirmOut] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data.data)).catch(() => setCats([]));
  }, []);

  const keluar = () => {
    setConfirmOut(false);
    adminLogout();
    toast.success("Berhasil keluar");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Pengaturan</h1>
        <p className="mt-1 text-sm text-moss">Kelola akun admin dan konfigurasi platform Torano.</p>
      </header>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Section icon={UserCog} title="Akun Admin">
          <dl>
            <Row label="Nama" value={getAdminName()} />
            <Row label="Peran" value="Super Admin" />
            <Row label="Wilayah" value="Manado, Sulawesi Utara" />
          </dl>
        </Section>

        <Section icon={Percent} title="Komisi & Pembayaran">
          <dl>
            <Row label="Biaya layanan platform" value="12%" />
            <Row label="Metode pembayaran" value="QRIS, VA, E-wallet" />
            <Row label="Penyedia" value="Midtrans" />
          </dl>
        </Section>

        <Section icon={ShieldCheck} title="Keamanan Dana (Escrow)">
          <dl>
            <Row label="Status escrow" value="Aktif" />
            <Row label="Pelepasan dana" value="Setelah pekerjaan dikonfirmasi" />
            <Row label="Sengketa" value="Ditangani admin" />
          </dl>
        </Section>

        <Section icon={Tags} title="Kategori Layanan">
          {cats.length === 0 ? (
            <p className="text-sm text-moss">Memuat kategori...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full bg-limesoft px-3 py-1 text-sm font-semibold text-forest"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </Section>
      </div>

      <section className="mt-5 rounded-2xl border border-line bg-white p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cloud text-moss">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-extrabold text-ink">Kredensial Admin</h2>
            <p className="text-sm text-moss">Ganti kata sandi untuk masuk ke panel admin.</p>
          </div>
        </div>
        <PasswordForm />
      </section>

      <button
        onClick={() => setConfirmOut(true)}
        className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Keluar dari panel admin
      </button>

      <ConfirmDialog
        open={confirmOut}
        title="Keluar dari panel admin?"
        message="Kamu perlu masuk lagi dengan kredensial admin."
        confirmLabel="Keluar"
        cancelLabel="Batal"
        danger
        onConfirm={keluar}
        onCancel={() => setConfirmOut(false)}
      />
    </div>
  );
};

export default AdminPengaturan;
