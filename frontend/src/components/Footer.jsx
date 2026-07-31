import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import logo from "../assets/LOGO.png";

const FLink = ({ to, children }) => (
  <li>
    <Link to={to} className="text-white/70 transition-colors hover:text-white">
      {children}
    </Link>
  </li>
);

// Footer jujur: hanya menautkan halaman yang memang ada.
const Footer = () => (
  <footer className="bg-ink text-white">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-auto" />
          <span className="text-xl font-extrabold lowercase tracking-tight text-white">
            torano
          </span>
        </div>
        <p className="mt-3 max-w-xs text-sm text-white/70">
          Menghubungkan warga Manado dengan pekerja lokal tepercaya untuk kebutuhan rumah dan
          pekerjaan sehari-hari, dengan pembayaran yang aman.
        </p>
        <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
          <MapPin className="h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
          Manado, Sulawesi Utara
        </p>
      </div>

      {/* Jelajahi */}
      <div>
        <p className="text-sm font-extrabold text-white">Jelajahi</p>
        <ul className="mt-3 space-y-2 text-sm">
          <FLink to="/">Beranda</FLink>
          <FLink to="/cari">Cari Pekerja</FLink>
          <FLink to="/cara-kerja">Cara Kerja</FLink>
          <FLink to="/keamanan">Keamanan</FLink>
        </ul>
      </div>

      {/* Torano */}
      <div>
        <p className="text-sm font-extrabold text-white">Torano</p>
        <ul className="mt-3 space-y-2 text-sm">
          <FLink to="/tentang">Tentang Kami</FLink>
          <FLink to="/daftar/pekerja">Jadi Pekerja</FLink>
          <FLink to="/login">Masuk</FLink>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
      © 2026 Torano. Dibuat untuk warga Manado.
    </div>
  </footer>
);

export default Footer;
