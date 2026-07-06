import { Link, NavLink } from "react-router-dom";
import logo from "../assets/LOGO.png";

const navItems = [
  { to: "/cari", label: "Cari Tenaga Kerja" },
  { to: "/peta", label: "Peta" },
  { to: "/#cara-kerja", label: "Cara Kerja" },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="Torano beranda"
        >
          <img src={logo} alt="" className="h-8 w-auto" />
          <span className="text-xl font-extrabold lowercase tracking-tight text-ink">
            torano
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-moss transition-colors hover:bg-cloud hover:text-ink"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-cloud sm:block"
          >
            Masuk
          </Link>
          <Link
            to="/login"
            className="ring-focus rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink"
          >
            Gabung jadi Pekerja
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
