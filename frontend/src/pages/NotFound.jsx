import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <p className="text-6xl font-extrabold text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-bold text-ink">
          Halaman ini nda ada
        </h1>
        <p className="mt-2 text-moss">
          Mungkin sudah pindah atau tautannya keliru. Ayo kembali cari tenaga
          kerja di sekitarmu.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-forest px-5 py-3 font-semibold text-white transition-colors hover:bg-ink"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
