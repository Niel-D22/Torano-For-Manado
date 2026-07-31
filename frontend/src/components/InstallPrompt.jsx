import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../lib/auth";
import logo from "../assets/LOGO.png";

const DISMISS_KEY = "torano_install_dismissed";

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

const isIOS = () =>
  typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

// Popup ajakan pasang aplikasi (PWA). Muncul dari bawah setelah pengguna login,
// bisa ditutup. Untuk semua peran (pencari, pekerja, admin).
const InstallPrompt = () => {
  const { user } = useAuth();
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  const loggedIn =
    !!user ||
    (typeof localStorage !== "undefined" && !!localStorage.getItem("torano_admin_token"));

  useEffect(() => {
    if (isStandalone()) return;
    const onBIP = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setShow(false);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Tampilkan setelah login, sedikit tertunda agar halus. Sekali per sesi.
  useEffect(() => {
    if (isStandalone() || !loggedIn) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const canShow = deferred || isIOS();
    if (!canShow) return;
    const t = setTimeout(() => {
      setShow(true);
      if (!deferred && isIOS()) setIosHint(true);
    }, 1500);
    return () => clearTimeout(t);
  }, [deferred, loggedIn]);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setShow(false);
    setDeferred(null);
  };

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-[150] p-4 sm:inset-x-auto sm:right-4 sm:w-96"
        >
          <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_24px_60px_-20px_rgba(13,59,46,0.5)]">
            <div className="flex items-start gap-3">
              <img src={logo} alt="" className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-ink">Pasang aplikasi Torano</p>
                <p className="mt-0.5 text-xs text-moss">
                  Buka lebih cepat langsung dari layar utama, dan tetap bisa dipakai saat sinyal
                  lemah.
                </p>
              </div>
              <button
                onClick={dismiss}
                aria-label="Tutup"
                className="shrink-0 rounded-lg p-1 text-moss transition-colors hover:bg-cloud hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {iosHint ? (
              <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-paper px-3 py-2 text-xs text-moss">
                <Share className="h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
                Ketuk tombol Bagikan di Safari, lalu pilih "Tambah ke Layar Utama".
              </p>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={install}
                  className="ring-focus flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-forest py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Pasang sekarang
                </button>
                <button
                  onClick={dismiss}
                  className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-moss transition-colors hover:text-ink"
                >
                  Nanti
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
