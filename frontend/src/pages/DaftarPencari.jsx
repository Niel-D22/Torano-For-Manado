import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, User, Mail } from "lucide-react";
import { toast } from "sonner";
import logo from "../assets/LOGO.png";
import AuthShell from "../components/auth/AuthShell";
import { TextField, PasswordField } from "../components/auth/fields";
import GoogleButton from "../components/auth/GoogleButton";
import Spinner from "../components/Spinner";
import { useAuth } from "../lib/auth";

// Pendaftaran pencari kerja — cukup satu halaman, pakai email (bukan nomor HP).
const DaftarPencari = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const daftar = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register({ email, password, fullName: nama, role: "customer" });
      toast.success("Akun berhasil dibuat, selamat datang di Torano");
      navigate("/");
    } catch (e2) {
      toast.error(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setGoogleBusy(true);
    try {
      await loginWithGoogle();
    } catch (e2) {
      toast.error(e2.message);
      setGoogleBusy(false);
    }
  };

  return (
    <AuthShell>
      <div className="relative w-full max-w-[440px] rounded-3xl border border-line bg-white px-8 py-5 shadow-[0_30px_70px_rgba(13,59,46,0.12)] sm:px-10">
        <img src={logo} alt="Torano" className="mx-auto w-[104px]" />
        <h1 className="mt-3 text-center text-xl font-extrabold tracking-tight text-ink">
          Buat akun baru
        </h1>
        <p className="mt-1 text-center text-sm text-moss">
          Daftar untuk mulai cari atau terima pekerjaan
        </p>

        <form className="mt-5 space-y-3" onSubmit={daftar}>
          <TextField
            id="nama"
            label="Nama Lengkap"
            icon={User}
            placeholder="Contoh: Andi Setiawan"
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
            placeholder="contoh: andi@email.com"
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
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-ink">Data kamu aman</p>
              <p className="text-xs text-moss">
                Kami menggunakan enkripsi untuk melindungi data pribadimu.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="ring-focus flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-bold text-white transition-colors hover:bg-forest disabled:opacity-70"
          >
            {busy && <Spinner />}
            {busy ? "Memproses…" : "Daftar"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="text-sm text-moss">atau</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <GoogleButton label="Daftar dengan Google" onClick={google} loading={googleBusy} />

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

export default DaftarPencari;
