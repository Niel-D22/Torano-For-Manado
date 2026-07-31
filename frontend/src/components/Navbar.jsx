import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, MessageSquareText, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import logo from "../assets/LOGO.png";
import Avatar from "./Avatar";
import NotificationBell from "./NotificationBell";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../lib/auth";
import { useLayout } from "../lib/layout";

const navItems = [
  { to: "/", label: "Beranda" },
  { to: "/cari", label: "Kategori" },
  { to: "/cara-kerja", label: "Cara Kerja" },
  { to: "/daftar/pekerja", label: "Jadi Pekerja" },
];

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-ink/90 transition-colors hover:bg-cloud hover:text-ink";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { wide } = useLayout();
  const navigate = useNavigate();
  const [confirmOut, setConfirmOut] = useState(false);

  const keluar = async () => {
    setConfirmOut(false);
    await logout();
    toast.success("Berhasil keluar");
    navigate("/");
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div
        className={`mx-auto flex items-center justify-between px-4 py-3 sm:px-6 ${
          wide ? "max-w-full" : "max-w-7xl"
        }`}
      >
        {/* Kelompok kiri: logo + navigasi (mengikuti komposisi referensi) */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link to="/" className="flex items-center gap-2" aria-label="Torano beranda">
            <img src={logo} alt="" className="h-9 w-auto" />
            <span className="text-xl font-extrabold lowercase tracking-tight text-ink">
              torano
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.label} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {user ? (
          // ── Sudah login: akses cepat + menu akun ──
          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/cari" className={`hidden items-center gap-1.5 ${linkClass} sm:flex`}>
              <Heart className="h-4 w-4" aria-hidden="true" />
              Favorit
            </NavLink>
            <NavLink to="/chat" className={`hidden items-center gap-1.5 ${linkClass} sm:flex`}>
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
              Pesanan Saya
            </NavLink>
            <NotificationBell chatPath="/chat" />

            <details className="group relative">
              <summary className="ring-focus flex cursor-pointer list-none items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-cloud">
                <Avatar
                  src={user.avatarUrl}
                  name={user.fullName}
                  className="h-8 w-8 ring-1 ring-line"
                  textClass="text-xs"
                />
                <span className="hidden text-sm font-semibold text-ink sm:inline">
                  {user.fullName?.split(" ")[0] ?? "Akun"}
                </span>
                <ChevronDown className="h-4 w-4 text-moss transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-[0_20px_50px_-20px_rgba(13,59,46,0.4)]">
                <Link to="/akun" className="block px-4 py-2 text-sm text-ink hover:bg-cloud">
                  Akun Saya
                </Link>
                <Link to="/chat" className="block px-4 py-2 text-sm text-ink hover:bg-cloud">
                  Pesanan Saya
                </Link>
                <Link to="/cari" className="block px-4 py-2 text-sm text-ink hover:bg-cloud">
                  Favorit
                </Link>
                <div className="my-1 h-px bg-line" />
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
        ) : (
          // ── Belum login: masuk / bergabung ──
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-cloud sm:block"
            >
              Masuk
            </Link>
            <Link
              to="/daftar"
              className="ring-focus rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>

    <ConfirmDialog
      open={confirmOut}
      title="Keluar dari akun?"
      message="Kamu perlu masuk lagi untuk melanjutkan."
      confirmLabel="Keluar"
      cancelLabel="Batal"
      danger
      onConfirm={keluar}
      onCancel={() => setConfirmOut(false)}
    />
    </>
  );
};

export default Navbar;
