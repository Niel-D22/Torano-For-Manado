import { useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Wallet,
  UserRound,
  Bell,
  ArrowLeft,
} from "lucide-react";
import logo from "../assets/LOGO.png";
import { workerPhotos } from "../assets/workers/photos";
import { partner } from "../data/partner";

const nav = [
  { to: "/mitra", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/mitra/pesanan", label: "Pesanan", Icon: ClipboardList },
  { to: "/mitra/jadwal", label: "Jadwal", Icon: CalendarDays },
  { to: "/mitra/saldo", label: "Saldo", Icon: Wallet },
  { to: "/mitra/profil", label: "Profil", Icon: UserRound },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-limesoft text-ink"
      : "text-moss hover:bg-cloud hover:text-ink"
  }`;

const WorkerLayout = () => {
  const [available, setAvailable] = useState(true);

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Sidebar kiri (khusus mitra) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white md:flex">
        <Link to="/mitra" className="flex items-center gap-2 px-6 py-5">
          <img src={logo} alt="" className="h-8 w-auto" />
          <span className="text-lg font-extrabold lowercase tracking-tight text-ink">
            torano
          </span>
          <span className="rounded-md bg-limesoft px-1.5 py-0.5 text-[11px] font-bold text-forest">
            Mitra
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

        <div className="border-t border-line px-3 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-moss transition-colors hover:bg-cloud hover:text-ink"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
            Mode pencari
          </Link>
        </div>
      </aside>

      {/* ── Area konten ── */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          {/* Logo untuk layar kecil (sidebar tersembunyi) */}
          <Link to="/mitra" className="flex items-center gap-2 md:hidden">
            <img src={logo} alt="" className="h-8 w-auto" />
            <span className="text-lg font-extrabold lowercase text-ink">torano</span>
          </Link>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setAvailable((v) => !v)}
              aria-pressed={available}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                available
                  ? "bg-forest text-white"
                  : "border border-line bg-white text-moss"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${available ? "bg-lime" : "bg-moss"}`}
              />
              {available ? "Tersedia" : "Tidak tersedia"}
            </button>

            <button
              type="button"
              aria-label="Notifikasi"
              className="ring-focus relative rounded-lg p-2 text-ink/90 hover:bg-cloud hover:text-ink"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-forest px-1 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            <div className="flex items-center gap-2">
              <img
                src={workerPhotos[partner.photoId]}
                alt=""
                className="h-8 w-8 rounded-full object-cover ring-1 ring-line"
              />
              <span className="hidden text-sm font-semibold text-ink sm:inline">
                {partner.name.split(" ")[0]}
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

export default WorkerLayout;
