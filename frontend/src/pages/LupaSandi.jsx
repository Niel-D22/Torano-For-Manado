import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import logo from "../assets/LOGO.png";
import bgLogin from "../assets/BG_HeroLandingPage.png";
import Spinner from "../components/Spinner";
import { useAuth } from "../lib/auth";

const inputClass =
  "ring-focus h-12 w-full rounded-[14px] border border-line bg-paper px-4 text-sm text-ink placeholder:text-moss/60 focus:outline-none";

// Halaman minta tautan reset kata sandi. Supabase mengirim email berisi tautan
// menuju /reset-sandi tempat pengguna menyetel kata sandi baru.
const LupaSandi = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const kirim = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
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

        {sent ? (
          <div className="mt-5 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-limesoft text-forest">
              <MailCheck className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">Cek emailmu</h1>
            <p className="mt-2 text-sm text-moss">
              Kami mengirim tautan penyetelan ulang kata sandi ke{" "}
              <span className="font-semibold text-ink">{email}</span>. Buka tautannya untuk
              membuat kata sandi baru. Bila tidak ada, cek folder Spam.
            </p>
            <Link
              to="/login"
              className="ring-focus mt-6 inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-ink text-sm font-bold text-white transition-colors hover:bg-forest"
            >
              Kembali ke halaman masuk
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-center text-2xl font-extrabold tracking-tight text-ink">
              Lupa kata sandi?
            </h1>
            <p className="mt-1.5 text-center text-sm text-moss">
              Masukkan emailmu, kami kirim tautan untuk menyetel ulang kata sandi.
            </p>

            <form className="mt-6 space-y-4" onSubmit={kirim}>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-ink">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: nanda@email.com"
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="ring-focus flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-ink text-sm font-bold text-white transition-colors hover:bg-forest disabled:opacity-70"
              >
                {busy && <Spinner />}
                {busy ? "Mengirim…" : "Kirim tautan reset"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link
                to="/login"
                className="ring-focus inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-forest hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Kembali ke halaman masuk
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LupaSandi;
