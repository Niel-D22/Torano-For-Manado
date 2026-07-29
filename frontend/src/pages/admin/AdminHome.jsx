import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { getAdminName } from "../../lib/adminApi";

const AdminHome = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">
        Selamat datang, {getAdminName().split(" ")[0]} 👋
      </h1>
      <p className="mt-1 text-sm text-moss">
        Panel admin Torano. Kelola verifikasi mitra, transaksi, dan pengguna.
      </p>

      <Link
        to="/admin/verifikasi"
        className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-white p-5 transition-colors hover:border-forest/40"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-limesoft text-forest">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold text-ink">Verifikasi Mitra</span>
            <span className="block text-sm text-moss">
              Tinjau & proses pendaftaran mitra baru
            </span>
          </span>
        </span>
        <ArrowRight className="h-5 w-5 text-moss" aria-hidden="true" />
      </Link>
    </div>
  );
};

export default AdminHome;
