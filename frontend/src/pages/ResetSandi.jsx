import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import logo from "../assets/LOGO.png";
import bgLogin from "../assets/BG_HeroLandingPage.png";
import Spinner from "../components/Spinner";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

const inputClass =
  "ring-focus h-12 w-full rounded-[14px] border border-line bg-paper px-4 text-sm text-ink placeholder:text-moss/60 focus:outline-none";

// Halaman setel kata sandi baru. Diakses lewat tautan pemulihan dari email.
// Supabase memproses token di URL otomatis dan membuat sesi pemulihan.
const ResetSandi = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setChecking(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const simpan = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Kata sandi minimal 8 karakter");
      return;
    }
    if (password !== confirm) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      toast.success("Kata sandi berhasil diubah. Silakan masuk.");
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-paper px-6 py-6">
      <img
        src={bgLogin}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
      />

      <div className="relative w-full max-w-[520px] rounded-[24px] border border-line bg-white px-8 py-8 shadow-[0_30px_70px_rgba(13,59,46,0.12)] sm:px-12">
        <img src={logo} alt="Torano" className="mx-auto w-[clamp(84px,10vh,116px)] max-w-full" />

        {checking ? (
          <div className="mt-8 grid place-items-center py-6">
            <Spinner className="h-8 w-8 text-forest" />
          </div>
        ) : !ready ? (
          <div className="mt-5 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
              <ShieldAlert className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
              Tautan tidak berlaku
            </h1>
            <p className="mt-2 text-sm text-moss">
              Tautan reset sudah kedaluwarsa atau tidak valid. Minta tautan baru.
            </p>
            <Link
              to="/lupa-sandi"
              className="ring-focus mt-6 inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-ink text-sm font-bold text-white transition-colors hover:bg-forest"
            >
              Minta tautan baru
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-center text-2xl font-extrabold tracking-tight text-ink">
              Buat kata sandi baru
            </h1>
            <p className="mt-1.5 text-center text-sm text-moss">
              Masukkan kata sandi baru untuk akunmu.
            </p>

            <form className="mt-6 space-y-3.5" onSubmit={simpan}>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-ink">
                  Kata sandi baru
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className={`${inputClass} pr-14`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                    className="ring-focus absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-moss transition-colors hover:text-ink"
                  >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm font-bold text-ink">
                  Ulangi kata sandi
                </label>
                <input
                  id="confirm"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="ring-focus flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-ink text-sm font-bold text-white transition-colors hover:bg-forest disabled:opacity-70"
              >
                {busy && <Spinner />}
                {busy ? "Menyimpan…" : "Simpan kata sandi"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetSandi;
