import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  MapPin,
  BadgeCheck,
  CheckCircle2,
  ArrowRight,
  Users,
  Quote,
} from "lucide-react";
import Avatar from "../components/Avatar";
import Reveal from "../components/landing/Reveal";
import KotakSaran from "../components/KotakSaran";
import pulauLogo from "../assets/tentangKami/pulauLogo.png";
import handshake from "../assets/tentangKami/handshake.png";
import daniel from "../assets/tentangKami/daniel.webp";
import ahmad from "../assets/tentangKami/ahmad.webp";
import marco from "../assets/tentangKami/marco.webp";

const UNIVERSITY = "Universitas Katolik De La Salle Manado";

// Poin kepercayaan (bukan angka karangan). Menjaga tata letak tiga kartu.
const STATS = [
  { Icon: ShieldCheck, value: "100%", label: "mitra terverifikasi" },
  { Icon: Lock, value: "Escrow", label: "pembayaran diamankan" },
  { Icon: MapPin, value: "Manado", label: "fokus wilayah layanan" },
];

const CHIPS = [
  {
    Icon: ShieldCheck,
    label: "Pekerja Terverifikasi",
    pos: "left-4 top-6 sm:-left-4",
  },
  { Icon: Lock, label: "Pembayaran Aman", pos: "right-4 top-1/3 sm:-right-3" },
  { Icon: MapPin, label: "Fokus Lokal Manado", pos: "bottom-8 left-1/3" },
];

const POINTS = [
  "Banyak pekerja informal masih bergantung pada rekomendasi dari mulut ke mulut.",
  "Rumah tangga kesulitan menemukan pekerja yang benar benar terpercaya.",
  "Torano menyediakan platform yang aman, transparan, dan mudah digunakan.",
  "Mendorong pemerataan akses ekonomi melalui teknologi digital.",
];

const VALUES = [
  {
    Icon: BadgeCheck,
    title: "Mitra Terverifikasi",
    desc: "Setiap pekerja melewati proses verifikasi wajah, data diri, referensi komunitas, dan rekening sebelum bergabung.",
  },
  {
    Icon: Lock,
    title: "Escrow Pembayaran Aman",
    desc: "Uang pelanggan ditahan Torano hingga pekerjaan selesai. Aman bagi kedua belah pihak.",
  },
  {
    Icon: MapPin,
    title: "Berbasis Komunitas Lokal",
    desc: "Fokus pada warga Manado dan sekitarnya untuk menciptakan ekosistem kerja yang saling percaya.",
  },
];

const TEAM = [
  {
    name: "Daniel Riky Warouw",
    role: "Ketua Tim",
    photo: daniel,
    desc: "Bertanggung jawab atas visi produk, strategi, dan pengalaman pengguna.",
  },
  {
    name: "Ahmad R. Wael",
    role: "Anggota Tim",
    photo: ahmad,
    desc: "Mengembangkan sistem backend, integrasi, dan arsitektur aplikasi.",
  },
  {
    name: "Marcois Makalew",
    role: "Anggota Tim",
    photo: marco,
    desc: "Merancang UI/UX yang intuitif dan pengalaman yang menyenangkan.",
  },
];

const TentangKami = () => (
  <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    {/* ── Hero ── */}
    <section className="grid items-center gap-10 lg:grid-cols-2">
      <Reveal from="right">
        <span className="inline-flex items-center rounded-full bg-limesoft px-3 py-1 text-xs font-bold uppercase tracking-widest text-forest">
          Tentang Kami
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Tentang Torano
        </h1>
        <p className="mt-4 max-w-xl text-moss">
          Torano adalah platform digital yang menghubungkan warga Manado dengan
          pekerja lokal terpercaya untuk kebutuhan rumah tangga, acara, maupun
          pekerjaan sehari hari.
        </p>

        <div className="mt-7 grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-white p-4"
            >
              <s.Icon className="h-5 w-5 text-forest" aria-hidden="true" />
              <p className="mt-3 text-xl font-extrabold text-ink sm:text-2xl">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-moss">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal from="left" delay={0.1}>
        <div className="relative">
          <img
            src={pulauLogo}
            alt="Ilustrasi suasana Manado dengan logo Torano"
            className="w-full select-none"
            draggable="false"
          />
          {CHIPS.map((c) => (
            <div
              key={c.label}
              className={`absolute ${c.pos} hidden items-center gap-2 rounded-2xl border border-line bg-white/95 px-3.5 py-2.5 shadow-[0_18px_40px_-20px_rgba(13,59,46,0.45)] backdrop-blur md:flex`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-limesoft text-forest">
                <c.Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-ink">{c.label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
    {/* ── Deskripsi lomba ── */}
    <Reveal className="mt-14">
      <section className="overflow-hidden rounded-3xl border border-line bg-[#f7f4ec]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <img
              src={handshake}
              alt="Dua warga Manado berjabat tangan"
              className="mx-auto w-40 select-none lg:w-full"
              draggable="false"
            />
          </div>

          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-widest text-forest">
              Deskripsi Lomba
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
              Torano Menjawab Tantangan VETERNITY BERAKSI 2026
            </h2>
            <p className="mt-3 text-sm text-moss">
              Proyek ini dikembangkan untuk menjawab tema lomba:
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-forest/20 bg-white p-4">
              <Quote
                className="mt-0.5 h-5 w-5 shrink-0 text-forest"
                aria-hidden="true"
              />
              <p className="text-sm font-bold text-ink">
                Bridging the Gap: Digital Platforms for Equitable Economic
                Access
              </p>
            </div>
          </div>

          <ul className="space-y-3 lg:col-span-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-forest"
                  aria-hidden="true"
                />
                <span className="text-sm text-ink">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Reveal>
    \{/* ── Tim pengembang ── */}
    <section className="mt-16">
      <Reveal className="text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Tim Pengembang
        </h2>
        <p className="mt-2 text-sm text-moss">
          Dibuat oleh mahasiswa {UNIVERSITY}.
        </p>
      </Reveal>
      <div className="mt-7 grid gap-5 sm:grid-cols-3">
        {TEAM.map((m, i) => (
          <Reveal key={m.name} delay={i * 0.08}>
            <div className="h-full rounded-3xl border border-line bg-white p-6">
              <div className="flex items-start gap-4">
                <Avatar
                  src={m.photo}
                  name={m.name}
                  className="h-16 w-16 shrink-0"
                  textClass="text-xl"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-ink">{m.name}</h3>
                  <span className="mt-1 inline-flex rounded-full bg-limesoft px-2.5 py-0.5 text-xs font-bold text-forest">
                    {m.role}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-moss">{m.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
    {/* ── CTA ── */}
    <Reveal className="mt-16">
      <section className="relative overflow-hidden rounded-3xl bg-ink px-6 py-8 sm:px-10 sm:py-10">
        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-5">
            <img
              src={handshake}
              alt=""
              aria-hidden="true"
              className="hidden h-24 w-24 shrink-0 rounded-2xl object-cover sm:block"
              draggable="false"
            />
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                Mari bertumbuh bersama warga Manado
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-white/75">
                Cari pekerja terpercaya untuk kebutuhanmu, atau bergabung jadi
                mitra dan dapatkan penghasilan.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              to="/cari"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-paper"
            >
              Cari Pekerja
            </Link>
            <Link
              to="/daftar/pekerja"
              className="flex items-center gap-1.5 rounded-xl border border-white/40 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Jadi Pekerja <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <Users
          className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-white/5"
          aria-hidden="true"
        />
      </section>
    </Reveal>
    {/* ── Kotak saran ── */}
    <div className="mt-16">
      <KotakSaran />
    </div>
  </div>
);

export default TentangKami;
