import { useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { Bell, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import logo from "../assets/LOGO.png";
import avatar from "../assets/avatar-nanda.jpg";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../lib/auth";

const nav = [
  { to: "/mitra", label: "Beranda", end: true },
  { to: "/mitra/jadwal", label: "Jadwal" },
  { to: "/mitra/penghasilan", label: "Penghasilan" },
  { to: "/mitra/ulasan", label: "Ulasan" },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? "text-ink" : "text-moss hover:text-ink"
  }`;

// Area mitra (POV pekerja) — navbar ATAS mengikuti mockup "profil-saya" UI Torano.
const WorkerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [online, setOnline] = useState(true);
  const [confirmOut, setConfirmOut] = useState(false);

  const keluar = async () => {
    setConfirmOut(false);
    await logout();
    toast.success("Berhasil keluar");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Kiri: logo + Mitra + navigasi */}
          <div className="flex items-center gap-4 lg:gap-8">
            <Link to="/mitra" className="flex items-center gap-2" aria-label="Torano Mitra">
              <img src={logo} alt="" className="h-9 w-auto" />
              <span className="text-xl font-extrabold lowercase tracking-tight text-ink">
                torano
              </span>
              <span className="rounded-md bg-limesoft px-1.5 py-0.5 text-[11px] font-bold text-forest">
                Mitra
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <NavLink key={item.label} to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Kanan: toggle online + notifikasi + akun */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setOnline((v) => !v)}
              aria-pressed={online}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                online
                  ? "border-limesoft bg-limesoft/60 text-forest"
                  : "border-line bg-white text-moss"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${online ? "bg-forest" : "bg-moss"}`} />
              {online ? "Menerima pekerjaan" : "Sedang libur"}
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

            <details className="group relative">
              <summary className="ring-focus flex cursor-pointer list-none items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-cloud">
                <img
                  src={user?.avatarUrl || avatar}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-line"
                />
                <ChevronDown className="h-4 w-4 text-moss transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-[0_20px_50px_-20px_rgba(13,59,46,0.4)]">
                <div className="border-b border-line px-4 py-2">
                  <p className="truncate text-sm font-bold text-ink">
                    {user?.fullName ?? "Mitra"}
                  </p>
                  <p className="text-xs text-moss">Akun pekerja</p>
                </div>
                <Link to="/mitra/profil" className="block px-4 py-2 text-sm text-ink hover:bg-cloud">
                  Profil Saya
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmOut(true)}
                  className="block w-full px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Keluar
                </button>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <ConfirmDialog
        open={confirmOut}
        title="Keluar dari akun mitra?"
        message="Kamu perlu masuk lagi untuk mengelola pekerjaan."
        confirmLabel="Keluar"
        cancelLabel="Batal"
        danger
        onConfirm={keluar}
        onCancel={() => setConfirmOut(false)}
      />
    </div>
  );
};

export default WorkerLayout;
