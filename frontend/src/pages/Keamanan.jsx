import { Link } from "react-router-dom";
import {
  Lock,
  BadgeCheck,
  Scale,
  Star,
  UserRound,
  Eye,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Lock,
    title: "Dana ditahan (escrow)",
    desc: "Setiap pembayaran ditahan Torano lebih dulu, bukan langsung ke pekerja. Dana baru dilepas setelah kamu mengonfirmasi pekerjaan selesai.",
  },
  {
    Icon: BadgeCheck,
    title: "Mitra terverifikasi",
    desc: "Setiap pekerja melewati verifikasi wajah, data diri, referensi komunitas, dan rekening sebelum bisa menerima pekerjaan.",
  },
  {
    Icon: Scale,
    title: "Sengketa ditengahi admin",
    desc: "Bila hasil tidak sesuai, ajukan sengketa lengkap dengan bukti. Admin meninjau lalu memutuskan dana dilepas, dikembalikan, atau dibagi.",
  },
  {
    Icon: Star,
    title: "Ulasan yang jujur",
    desc: "Ulasan hanya bisa diberikan setelah transaksi selesai, jadi penilaian mencerminkan pengalaman nyata.",
  },
  {
    Icon: Eye,
    title: "Privasi terjaga",
    desc: "Nomor telepon disamarkan di panel dan hanya dibagikan seperlunya untuk memudahkan pekerjaan.",
  },
  {
    Icon: UserRound,
    title: "Kontrol penuh atas akun",
    desc: "Kamu mengatur profil, foto, dan status ketersediaan. Pekerja bisa online atau libur kapan saja.",
  },
];

const Keamanan = () => (
  <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
    <header className="text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-forest">Keamanan</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Aman untuk pencari dan pekerja
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-moss">
        Kepercayaan adalah inti Torano. Kami merancang setiap langkah agar uang, data, dan pekerjaan
        terlindungi dari awal sampai selesai.
      </p>
    </header>

    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f) => (
        <div key={f.title} className="rounded-3xl border border-line bg-white p-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-limesoft text-forest">
            <f.Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-extrabold text-ink">{f.title}</h2>
          <p className="mt-1.5 text-sm text-moss">{f.desc}</p>
        </div>
      ))}
    </div>

    {/* Alur dana ringkas */}
    <div className="mt-10 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
        <ShieldCheck className="h-5 w-5 text-forest" aria-hidden="true" />
        Bagaimana dana kamu dijaga
      </h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          ["Dibayar", "Kamu bayar lewat QRIS, dana masuk ke escrow Torano."],
          ["Ditahan", "Dana ditahan aman selama pekerjaan berlangsung."],
          ["Dilepas", "Dana dilepas ke pekerja hanya setelah kamu konfirmasi selesai."],
        ].map(([t, d], i) => (
          <li key={t} className="rounded-2xl bg-paper p-4">
            <span className="text-sm font-bold text-forest">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-1 font-extrabold text-ink">{t}</p>
            <p className="mt-1 text-sm text-moss">{d}</p>
          </li>
        ))}
      </ol>
    </div>

    <div className="mt-8 text-center">
      <Link
        to="/cara-kerja"
        className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-6 py-3 text-sm font-bold text-white hover:bg-ink"
      >
        Lihat cara kerja lengkap <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </div>
);

export default Keamanan;
