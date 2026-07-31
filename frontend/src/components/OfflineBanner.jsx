import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

// Pemberitahuan saat perangkat offline (PWA). Muncul di bawah layar.
const OfflineBanner = () => {
  const [offline, setOffline] = useState(typeof navigator !== "undefined" && !navigator.onLine);
  const [justBack, setJustBack] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOffline(false);
      setJustBack(true);
      setTimeout(() => setJustBack(false), 2500);
    };
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (offline) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[200] flex items-center justify-center gap-2 bg-ink px-4 py-2.5 text-sm font-semibold text-white">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        Kamu sedang offline. Sebagian fitur mungkin terbatas.
      </div>
    );
  }
  if (justBack) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[200] flex items-center justify-center gap-2 bg-forest px-4 py-2.5 text-sm font-semibold text-white">
        <Wifi className="h-4 w-4 shrink-0" aria-hidden="true" />
        Kembali online.
      </div>
    );
  }
  return null;
};

export default OfflineBanner;
