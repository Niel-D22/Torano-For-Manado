import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/LOGO.png";
import bgLogin from "../assets/BG_HeroLandingPage.png";
import { useAuth } from "../lib/auth";

// Ikon Google resmi (empat warna) — lucide tidak menyediakan logo merek
const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
    />
  </svg>
);

const inputClass =
  "ring-focus h-12 w-full rounded-[14px] border border-line bg-paper px-4 text-sm text-ink placeholder:text-moss/60 focus:outline-none";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Setelah masuk, kembali ke halaman yang tadi digerbang (?next=), atau beranda.
  const masuk = (e) => {
    e.preventDefault();
    login();
    navigate(params.get("next") || "/", { replace: true });
  };

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-paper px-6 py-5">
      {/* Lukisan cat air Manado — latar yang sama dengan hero landing page */}
      <img
        src={bgLogin}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
      />

      {/* Kartu login — spacing kompak agar selalu muat setinggi layar */}
      <div className="relative max-h-full w-full max-w-[520px] overflow-y-auto rounded-[24px] border border-[#EAE5DB] bg-white px-8 py-6 shadow-[0_30px_70px_rgba(13,59,46,0.12)] sm:px-12">
        {/* Lebar logo mengikuti tinggi layar: 120px (layar pendek) s.d. 176px */}
        <img
          src={logo}
          alt="Torano"
          className="mx-auto w-[clamp(96px,13vh,140px)] max-w-full"
        />

        <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-ink">
          Selamat datang kembali
        </h1>
        <p className="mt-1.5 text-center text-sm text-moss">
          Masuk untuk mulai cari atau terima pekerjaan.
        </p>

        <form className="mt-6 space-y-4" onSubmit={masuk}>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-bold text-ink"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="contoh: nanda@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-bold text-ink"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                className={`${inputClass} pr-14`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"
                }
                className="ring-focus absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-moss transition-colors hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link
                to="/login"
                className="text-sm font-semibold text-forest hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="ring-focus h-12 w-full rounded-[14px] bg-ink text-sm font-bold text-white transition-colors hover:bg-forest"
          >
            Masuk
          </button>
        </form>

        {/* Pemisah */}
        <div className="mt-5 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="text-sm text-moss">atau</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={masuk}
          className="ring-focus mt-5 flex h-12 w-full items-center justify-center gap-2.5 rounded-[14px] border border-line bg-white text-sm font-bold text-ink transition-colors hover:bg-paper"
        >
          <GoogleIcon className="h-5 w-5" />
          Masuk dengan Google
        </button>

        <p className="mt-6 text-center text-sm text-moss">
          Belum punya akun?{" "}
          <Link to="/daftar" className="font-bold text-forest hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
