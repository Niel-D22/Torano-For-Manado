import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, MessagesSquare, Star, ShieldCheck, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

// Ganti "statistik" yang mengarang dengan keunggulan nyata (aplikasi masih baru).
const features = [
  {
    Icon: BadgeCheck,
    title: "Mitra terverifikasi",
    desc: "Setiap pekerja lolos verifikasi wajah, data diri, dan referensi komunitas sebelum aktif.",
  },
  {
    Icon: MapPin,
    title: "Temukan yang terdekat",
    desc: "Tandai lokasimu di peta, lalu lihat pekerja tepercaya di sekitarmu lengkap dengan jaraknya.",
  },
  {
    Icon: MessagesSquare,
    title: "Chat & tawar harga",
    desc: "Diskusikan kebutuhan dan sepakati harga langsung di aplikasi, tanpa perantara.",
  },
  {
    Icon: Star,
    title: "Ulasan jujur",
    desc: "Ulasan hanya bisa diberi setelah pekerjaan selesai, jadi penilaian benar benar nyata.",
  },
];

const TrustStats = () => (
  <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
    <Reveal className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-moss">Kenapa Torano</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Dibangun di atas kepercayaan
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-moss">
        Bukan sekadar mempertemukan. Torano menjaga tiap langkah tetap aman untuk pencari maupun
        pekerja, dari pertama cari sampai pekerjaan beres.
      </p>
    </Reveal>

    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {features.map(({ Icon, title, desc }, i) => (
        <Reveal key={title} delay={i * 0.08}>
          <div className="h-full rounded-3xl border border-line bg-white p-6 transition-shadow duration-300 hover:shadow-[0_24px_50px_-30px_rgba(13,59,46,0.4)]">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-limesoft text-forest">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-extrabold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm text-moss">{desc}</p>
          </div>
        </Reveal>
      ))}
    </div>

    {/* Kartu escrow — janji keamanan inti Torano (jujur, bukan statistik) */}
    <Reveal delay={0.1}>
      <div className="mx-auto mt-8 flex max-w-3xl items-start gap-4 rounded-3xl border border-forest/20 bg-limesoft/30 p-6 sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest text-white">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-extrabold text-ink">
            Pembayaran ditahan Torano sampai pekerjaan selesai
          </h3>
          <p className="mt-1 text-sm text-moss">
            Uang kamu aman di Torano. Kami lepas pembayaran ke pekerja hanya setelah kamu konfirmasi
            pekerjaan beres.
          </p>
          <Link
            to="/keamanan"
            className="ring-focus mt-2 inline-flex items-center gap-1 text-sm font-bold text-forest hover:text-ink"
          >
            Pelajari sistem pembayaran aman
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Reveal>
  </section>
);

export default TrustStats;
