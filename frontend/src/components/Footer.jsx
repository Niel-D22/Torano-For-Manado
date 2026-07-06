import { Link } from "react-router-dom";
import logo from "../assets/LOGO.png";

const Footer = () => {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-8 w-auto" />
            <span className="text-lg font-extrabold lowercase tracking-tight text-ink">
              torano
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-forest">
            Kerja. Terhubung. Terpercaya.
          </p>
          <p className="mt-2 text-sm text-moss">
            Menghubungkan tenaga kerja tepercaya dengan warga Manado — berbasis
            kepercayaan komunal.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-moss">
          <Link to="/cari" className="hover:text-ink">
            Cari Tenaga Kerja
          </Link>
          <Link to="/login" className="hover:text-ink">
            Gabung jadi Pekerja
          </Link>
          <a href="/#cara-kerja" className="hover:text-ink">
            Cara Kerja
          </a>
        </nav>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-moss">
        © 2026 Torano · Dibuat untuk Manado
      </div>
    </footer>
  );
};

export default Footer;
