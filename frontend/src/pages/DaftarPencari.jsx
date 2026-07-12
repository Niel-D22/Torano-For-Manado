import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, User } from "lucide-react";
import logo from "../assets/LOGO.png";
import AuthShell from "../components/auth/AuthShell";
import { TextField, PhoneField, PasswordField } from "../components/auth/fields";
import GoogleButton from "../components/auth/GoogleButton";
import { useAuth } from "../lib/auth";

// Pendaftaran pencari kerja — cukup satu halaman (tanpa wizard).
const DaftarPencari = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const daftar = (e) => {
    e.preventDefault();
    login(); // ponytail: langsung aktif & masuk beranda; sambungkan auth backend nanti
    navigate("/");
  };

  return (
    <AuthShell>
      <div className="relative w-full max-w-[440px] rounded-3xl border border-[#EAE5DB] bg-white px-8 py-5 shadow-[0_30px_70px_rgba(13,59,46,0.12)] sm:px-10">
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
          />
          <PhoneField
            id="telepon"
            label="Nomor Telepon"
            note={
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-moss">
                <ShieldCheck className="h-4 w-4 text-forest" aria-hidden="true" />
                Kami akan kirim kode OTP ke nomor ini
              </p>
            }
          />
          <PasswordField
            id="sandi"
            label="Kata Sandi"
            withIcon
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
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
            className="ring-focus h-11 w-full rounded-xl bg-ink text-sm font-bold text-white transition-colors hover:bg-forest"
          >
            Daftar
          </button>
        </form>

        <div className="my-4 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="text-sm text-moss">atau</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <GoogleButton label="Daftar dengan Google" />

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
