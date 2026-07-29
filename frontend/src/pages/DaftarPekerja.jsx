import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, BadgeCheck } from "lucide-react";
import logo from "../assets/LOGO.png";
import AuthShell from "../components/auth/AuthShell";
import { TextField, PasswordField } from "../components/auth/fields";
import GoogleButton from "../components/auth/GoogleButton";
import { useAuth } from "../lib/auth";

// Pendaftaran pekerja = cukup BUAT AKUN. Data keahlian, tarif, area, foto
// verifikasi, dan referensi dilengkapi nanti di dalam (setelah login) melalui
// halaman verifikasi mitra, lalu ditinjau admin.
const DaftarPekerja = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const daftar = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await register({ email, password, fullName: nama, role: "worker" });
      navigate("/mitra");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr("");
    try {
      await loginWithGoogle();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  return (
    <AuthShell>
      <div className="relative w-full max-w-[440px] rounded-3xl border border-line bg-white px-8 py-5 shadow-[0_30px_70px_rgba(13,59,46,0.12)] sm:px-10">
        <img src={logo} alt="Torano" className="mx-auto w-[104px]" />
        <h1 className="mt-3 text-center text-xl font-extrabold tracking-tight text-ink">
          Daftar sebagai Pekerja
        </h1>
        <p className="mt-1 text-center text-sm text-moss">
          Buat akun dulu — data verifikasi dilengkapi setelah masuk.
        </p>

        {err && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
            {err}
          </p>
        )}

        <form className="mt-5 space-y-3" onSubmit={daftar}>
          <TextField
            id="nama"
            label="Nama Lengkap"
            icon={User}
            placeholder="Contoh: Ventje Tumbelaka"
            autoComplete="name"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          <TextField
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            placeholder="contoh: ventje@email.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField
            id="sandi"
            label="Kata Sandi"
            withIcon
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-start gap-2.5 rounded-2xl bg-limesoft/50 p-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-ink">Langkah verifikasi menyusul</p>
              <p className="text-xs text-moss">
                Setelah masuk, lengkapi keahlian, tarif, area, & foto verifikasi
                untuk ditinjau admin sebelum bisa menerima pekerjaan.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="ring-focus h-11 w-full rounded-xl bg-ink text-sm font-bold text-white transition-colors hover:bg-forest disabled:opacity-60"
          >
            {busy ? "Memproses…" : "Buat akun"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="text-sm text-moss">atau</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <GoogleButton label="Daftar dengan Google" onClick={google} />

        <p className="mt-4 text-center text-sm text-moss">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-forest hover:underline">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default DaftarPekerja;
