import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PhotoFrame from "./PhotoFrame";
import Reveal from "./Reveal";
import { landingPhotos } from "./assets";

// Ajakan bergabung untuk pekerja — full-bleed dengan foto golden hour
const PartnerCTA = () => (
  <section className="relative overflow-hidden bg-ink">
    <PhotoFrame
      src={landingPhotos.ctaMitra}
      alt="Pekerja memandang teluk Manado saat matahari terbenam"
      label="Foto: pekerja golden hour, teluk Manado"
      className="absolute inset-0 h-full w-full opacity-50"
    />
    <div
      className="absolute inset-0 bg-linear-to-r from-ink via-ink/80 to-ink/30"
      aria-hidden="true"
    />
    {/* Lelehkan tepi atas banner ke warna halaman — tanpa garis pemisah */}
    <div
      className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-paper to-transparent"
      aria-hidden="true"
    />

    <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-28">
      <Reveal className="max-w-xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Punya keahlian?{" "}
          <span className="text-sun">Jadilah Mitra Torano</span>
        </h2>
        <p className="mt-4 text-white/80">
          Dapatkan penghasilan tambahan, atur waktu kerja sendiri, dan dikenal
          lebih banyak warga di sekitarmu.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/login"
            className="ring-focus inline-flex items-center gap-2 rounded-xl bg-sun px-6 py-3.5 font-extrabold text-ink transition-colors hover:bg-white"
          >
            Daftar Jadi Pekerja
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-sm font-semibold text-white/70">
            Ribuan mitra sudah bergabung!
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

export default PartnerCTA;
