import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";
import { AnimatedOutlet } from "../components/PageTransition";
import {
  LayoutDashboard,
  ShieldCheck,
  Receipt,
  Scale,
  Users,
  Settings,
  Flag,
  Bell,
  LogOut,
} from "lucide-react";
import logo from "../assets/LOGO.png";
import Avatar from "../components/Avatar";
import { adminApi, adminLogout, getAdminName } from "../lib/adminApi";

const nav = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/admin/verifikasi", label: "Verifikasi Mitra", Icon: ShieldCheck },
  { to: "/admin/transaksi", label: "Transaksi", Icon: Receipt },
  { to: "/admin/sengketa", label: "Sengketa", Icon: Scale },
  { to: "/admin/laporan", label: "Laporan", Icon: Flag },
  { to: "/admin/pengguna", label: "Pengguna", Icon: Users },
  { to: "/admin/pengaturan", label: "Pengaturan", Icon: Settings },
];

const sejak = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
};

// Lonceng notifikasi admin: menarik data agregat dari /admin/notifications.
const NotifBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { data } = await adminApi.get("/admin/notifications");
      setItems(data.data.items || []);
      setCount(data.data.unreadCount || 0);
    } catch {
      /* diamkan; lonceng opsional */
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (link) => {
    setOpen(false);
    navigate(link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Notifikasi"
        onClick={() => setOpen((v) => !v)}
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
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-extrabold text-ink">Notifikasi</p>
            <span className="rounded-full bg-cloud px-2 py-0.5 text-xs font-bold text-moss">
              {count} baru
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-moss">Tidak ada notifikasi.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => go(n.link)}
                  className="flex w-full items-start gap-3 border-b border-line/60 px-4 py-3 text-left transition-colors hover:bg-cloud/60 last:border-0"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-forest" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">{n.title}</p>
                    <p className="truncate text-xs text-moss">{n.body}</p>
                    <p className="mt-0.5 text-[11px] text-slate">{sejak(n.at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-white/12 text-white"
      : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

const AdminLayout = () => {
  const navigate = useNavigate();
  const name = getAdminName();
  const [confirmOut, setConfirmOut] = useState(false);

  const keluar = () => {
    setConfirmOut(false);
    adminLogout();
    toast.success("Berhasil keluar");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Sidebar admin (hijau tua) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink text-white md:flex">
        <Link to="/admin" className="flex items-center gap-2 px-6 py-5">
          <img src={logo} alt="" className="h-8 w-auto" />
          <span className="text-lg font-extrabold lowercase tracking-tight text-white">
            torano
          </span>
          <span className="rounded-md bg-lime/20 px-1.5 py-0.5 text-[11px] font-bold text-lime">
            Admin
          </span>
        </Link>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink key={label} to={to} end={end} className={linkClass}>
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar name={name} className="h-9 w-9 ring-1 ring-white/20" textClass="text-xs" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{name}</p>
              <p className="truncate text-xs text-white/60">Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOut(true)}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Area konten ── */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <Link to="/admin" className="flex items-center gap-2 md:hidden">
            <img src={logo} alt="" className="h-8 w-auto" />
            <span className="text-lg font-extrabold lowercase text-ink">torano</span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <NotifBell />
            <div className="flex items-center gap-2">
              <Avatar name={name} className="h-8 w-8 ring-1 ring-line" textClass="text-xs" />
              <span className="hidden text-sm font-semibold text-ink sm:inline">
                {name.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        <main>
          <AnimatedOutlet />
        </main>
      </div>

      <ConfirmDialog
        open={confirmOut}
        title="Keluar dari panel admin?"
        message="Kamu perlu masuk lagi dengan kredensial admin."
        confirmLabel="Keluar"
        cancelLabel="Batal"
        danger
        onConfirm={keluar}
        onCancel={() => setConfirmOut(false)}
      />
    </div>
  );
};

export default AdminLayout;
