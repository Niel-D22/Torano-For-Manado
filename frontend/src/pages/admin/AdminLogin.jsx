import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import logo from "../../assets/LOGO.png";
import { adminLogin } from "../../lib/adminApi";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminLogin(username, password);
      toast.success("Selamat datang, Admin");
      navigate("/admin", { replace: true });
    } catch (e2) {
      toast.error(e2.response?.data?.error?.message || "Login gagal, coba lagi");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "ring-focus h-12 w-full rounded-xl border border-white/15 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-lime/50";

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-6 py-8">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="Torano" className="h-11 w-auto" />
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-lime">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Panel Admin
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
            Masuk sebagai Admin
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Kelola verifikasi mitra, transaksi, dan pengguna.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <input
              className={field}
              placeholder="Username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
            <input
              className={`${field} pr-12`}
              type={show ? "text" : "password"}
              placeholder="Kata sandi"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Sembunyikan" : "Lihat"}
              className="ring-focus absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/50 hover:text-white"
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="ring-focus flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime text-sm font-extrabold text-ink transition-colors hover:bg-white disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {busy ? "Memproses…" : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Halaman khusus administrator Torano.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
