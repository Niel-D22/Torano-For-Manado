import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Receipt,
  Scale,
  Users,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import logo from "../assets/LOGO.png";
import avatar from "../assets/avatar-nanda.jpg";
import { adminLogout, getAdminName } from "../lib/adminApi";

const nav = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/admin/verifikasi", label: "Verifikasi Mitra", Icon: ShieldCheck },
  { to: "/admin/transaksi", label: "Transaksi", Icon: Receipt },
  { to: "/admin/sengketa", label: "Sengketa", Icon: Scale },
  { to: "/admin/pengguna", label: "Pengguna", Icon: Users },
  { to: "/admin/pengaturan", label: "Pengaturan", Icon: Settings },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-white/12 text-white"
      : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

const AdminLayout = () => {
  const navigate = useNavigate();
  const name = getAdminName();

  const keluar = () => {
    adminLogout();
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
            <img
              src={avatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{name}</p>
              <p className="truncate text-xs text-white/60">Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={keluar}
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
            <button
              type="button"
              aria-label="Notifikasi"
              className="ring-focus relative rounded-lg p-2 text-ink/90 hover:bg-cloud hover:text-ink"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-forest px-1 text-[10px] font-bold text-white">
                8
              </span>
            </button>
            <div className="flex items-center gap-2">
              <img
                src={avatar}
                alt=""
                className="h-8 w-8 rounded-full object-cover ring-1 ring-line"
              />
              <span className="hidden text-sm font-semibold text-ink sm:inline">
                {name.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
