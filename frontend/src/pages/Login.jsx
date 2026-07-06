import { Link } from "react-router-dom";
import logo from "../assets/LOGO.png";

const Login = () => {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-[0_30px_70px_-40px_rgba(13,59,39,0.5)]">
        <img src={logo} alt="Torano" className="mx-auto h-11 w-auto" />
        <h1 className="mt-6 text-center text-2xl font-bold text-ink">
          Selamat datang kembali
        </h1>
        <p className="mt-1 text-center text-sm text-moss">
          Masuk untuk mulai cari atau terima pekerjaan.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Nomor HP
            </label>
            <input
              type="tel"
              placeholder="0812 3456 7890"
              className="ring-focus w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-moss/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Kata sandi
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="ring-focus w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-moss/60 focus:outline-none"
            />
          </div>
          <button className="ring-focus w-full rounded-xl bg-forest py-3.5 font-semibold text-white transition-colors hover:bg-ink">
            Masuk
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-moss">
          Belum punya akun?{" "}
          <Link to="/login" className="font-semibold text-forest hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
