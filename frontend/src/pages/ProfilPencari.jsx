import { useState } from "react";
import { toast } from "sonner";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import ImageUpload from "../components/ImageUpload";
import Spinner from "../components/Spinner";

const inputCls =
  "ring-focus h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink focus:outline-none";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-bold text-ink">{label}</span>
    {children}
  </label>
);

// Halaman akun pencari — ubah foto, nama, dan nomor telepon.
const ProfilPencari = () => {
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="grid place-items-center py-24 text-moss">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const saveAvatar = async (url) => {
    try {
      await api.patch("/auth/profile", { avatarUrl: url });
      await refresh();
      toast.success("Foto diperbarui");
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal menyimpan foto");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch("/auth/profile", {
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      await refresh();
      toast.success("Profil diperbarui");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal menyimpan, coba lagi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-ink">Akun Saya</h1>
      <p className="mt-1 text-moss">Kelola foto, nama, dan kontak akunmu.</p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {/* Foto profil */}
        <section className="rounded-2xl border border-line bg-white p-6 text-center md:col-span-1">
          <div className="mx-auto w-fit">
            <ImageUpload
              variant="avatar"
              value={user.avatarUrl}
              name={user.fullName}
              folder="avatar"
              onChange={saveAvatar}
            />
          </div>
          <h2 className="mt-3 truncate text-lg font-extrabold text-ink">
            {user.fullName || "Pengguna"}
          </h2>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-limesoft px-3 py-1 text-xs font-semibold text-forest">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            Akun pencari
          </span>
        </section>

        {/* Form data */}
        <section className="rounded-2xl border border-line bg-white p-6 md:col-span-2">
          <form onSubmit={save} className="space-y-4">
            <Field label="Nama lengkap">
              <input
                className={inputCls}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Field>
            <Field label="Nomor telepon">
              <input
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="mis. 0812xxxxxxx"
                inputMode="tel"
              />
            </Field>
            <div>
              <span className="mb-1.5 block text-sm font-bold text-ink">Email</span>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-cloud px-3 text-sm text-moss">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {user.email || "-"}
                <span className="ml-auto text-xs">Tidak bisa diubah</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="ring-focus flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
            >
              {busy && <Spinner />}
              {busy ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>

          <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-xs text-moss">
            <ShieldCheck className="h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
            Datamu hanya dipakai untuk mempermudah pekerja menghubungimu saat memesan.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ProfilPencari;
