import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageSquareText, CalendarCheck, Star, BellRing } from "lucide-react";
import { api } from "../lib/api";
import { canNotify, notifyPermission, requestNotify, showNotify } from "../lib/webNotify";
import { subscribeToPush } from "../lib/push";

const ICONS = {
  message: MessageSquareText,
  booking: CalendarCheck,
  review: Star,
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "baru saja";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
};

// Lonceng notifikasi nyata: menarik data dari /api/notifications (pesan belum
// dibaca, booking baru, ulasan). Badge = jumlah yang belum ditindaklanjuti.
// chatPath: tujuan saat item pesan diklik (beda untuk pencari vs pekerja).
const NotificationBell = ({ chatPath = "/chat" }) => {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [perm, setPerm] = useState(notifyPermission());
  const navigate = useNavigate();
  const ref = useRef(null);
  const seenIds = useRef(null); // set id yang sudah pernah dilihat
  const firstLoad = useRef(true);

  const load = () =>
    api
      .get("/notifications")
      .then((r) => {
        const data = r.data.data;
        setItems(data.items);
        setCount(data.unreadCount);
        // Munculkan notifikasi perangkat untuk item baru yang belum pernah dilihat.
        const ids = new Set(data.items.map((i) => i.id));
        if (!firstLoad.current && seenIds.current) {
          const fresh = data.items.filter((i) => i.unread && !seenIds.current.has(i.id));
          if (fresh.length > 0) {
            const top = fresh[0];
            showNotify(
              top.title,
              top.body,
              () => navigate(top.type === "message" ? chatPath : top.link),
            );
          }
        }
        seenIds.current = ids;
        firstLoad.current = false;
      })
      .catch(() => {});

  const enableNotify = async () => {
    const p = await requestNotify();
    setPerm(p);
    if (p === "granted") {
      subscribeToPush(); // langganan push agar muncul walau aplikasi tertutup
      showNotify("Notifikasi Torano aktif", "Kamu akan diberi tahu di sini.");
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // segarkan berkala
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tutup saat klik di luar.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const go = (item) => {
    setOpen(false);
    navigate(item.type === "message" ? chatPath : item.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        aria-label="Notifikasi"
        className="ring-focus relative rounded-lg p-2 text-ink/90 hover:bg-cloud hover:text-ink"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {count > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-forest px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_50px_-20px_rgba(13,59,46,0.4)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-extrabold text-ink">Notifikasi</p>
            {count > 0 && (
              <span className="rounded-full bg-limesoft px-2 py-0.5 text-xs font-bold text-forest">
                {count} baru
              </span>
            )}
          </div>
          {canNotify() && perm === "default" && (
            <button
              onClick={enableNotify}
              className="flex w-full items-center gap-2 border-b border-line bg-limesoft/30 px-4 py-2.5 text-left text-sm font-semibold text-forest hover:bg-limesoft/50"
            >
              <BellRing className="h-4 w-4 shrink-0" aria-hidden="true" />
              Aktifkan notifikasi di perangkat ini
            </button>
          )}
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="grid place-items-center gap-2 px-4 py-10 text-center text-sm text-moss">
                <Bell className="h-8 w-8 text-line" aria-hidden="true" />
                Belum ada notifikasi.
              </div>
            ) : (
              items.map((n) => {
                const Icon = ICONS[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => go(n)}
                    className={`flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors hover:bg-cloud ${
                      n.unread ? "bg-limesoft/20" : ""
                    }`}
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-limesoft text-forest">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{n.title}</p>
                      <p className="truncate text-sm text-moss">{n.body}</p>
                      <p className="mt-0.5 text-xs text-moss">{timeAgo(n.at)}</p>
                    </div>
                    {n.unread && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-forest" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
