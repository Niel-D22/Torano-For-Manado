import { Link } from "react-router-dom";
import { ShieldCheck, Users, MapPin, Heart, Lock, BadgeCheck, ArrowRight } from "lucide-react";
import Avatar from "../components/Avatar";

const TEAM = [
  { name: "Daniel Riky Warouw", role: "Ketua Tim", photo: null },
  { name: "Ahmad R. Wael", role: "Anggota Tim", photo: null },
  { name: "Marcois Makalew", role: "Anggota Tim", photo: null },
];

const UNIVERSITY = "Universitas Katolik De La Salle Manado";

const VALUES = [
  {
    Icon: BadgeCheck,
    title: "Mitra terverifikasi",
    desc: "Setiap pekerja melewati verifikasi wajah, data diri, referensi komunitas, dan rekening sebelum menerima pekerjaan.",
  },
  {
    Icon: Lock,
    title: "Pembayaran ditahan",
    desc: "Uang pelanggan ditahan Torano dan baru dilepas ke pekerja setelah pekerjaan dikonfirmasi selesai.",
  },
  {
    Icon: MapPin,
    title: "Fokus lokal Manado",
    desc: "Dibangun khusus untuk warga Manado, mengutamakan pekerja di sekitarmu yang bisa dipercaya.",
  },
];

const TentangKami = () => (
  <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
    {/* Hero */}
    <header className="text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-forest">Tentang Kami</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Torano, wadah kerja tepercaya warga Manado
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-moss">
        Torano mempertemukan rumah tangga di Manado dengan pekerja lokal tepercaya, mulai dari ART
        dan bersih rumah, tukang harian, kru acara dan adat, hingga montir panggilan, dalam satu
        aplikasi yang aman dan mudah.
      </p>
    </header>

    {/* Cerita / masalah & solusi */}
    <section className="mt-12 grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="flex items-center gap-2 font-extrabold text-ink">
          <Users className="h-5 w-5 text-forest" aria-hidden="true" />
          Masalah yang kami pecahkan
        </h2>
        <p className="mt-3 text-sm text-moss">
          Mencari tukang atau ART yang benar benar bisa dipercaya sering mengandalkan kabar dari mulut
          ke mulut, tanpa jaminan hasil maupun keamanan pembayaran. Pekerja lokal yang jujur pun sulit
          mendapat pelanggan baru di luar lingkarannya.
        </p>
      </div>
      <div className="rounded-3xl border border-line bg-white p-6">
        <h2 className="flex items-center gap-2 font-extrabold text-ink">
          <ShieldCheck className="h-5 w-5 text-forest" aria-hidden="true" />
          Cara Torano membantu
        </h2>
        <p className="mt-3 text-sm text-moss">
          Kami memverifikasi setiap mitra, menahan pembayaran secara aman sampai pekerjaan selesai,
          dan menyediakan chat, penawaran harga, serta ulasan yang jujur. Hasilnya, pencari tenang dan
          pekerja lokal mendapat kesempatan yang adil.
        </p>
      </div>
    </section>

    {/* Nilai */}
    <section className="mt-6 grid gap-5 sm:grid-cols-3">
      {VALUES.map((v) => (
        <div key={v.title} className="rounded-3xl border border-line bg-white p-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-limesoft text-forest">
            <v.Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-extrabold text-ink">{v.title}</h3>
          <p className="mt-1.5 text-sm text-moss">{v.desc}</p>
        </div>
      ))}
    </section>

    {/* Tim */}
    <section className="mt-14">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-forest">Tim Kami</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Tiga mahasiswa di balik Torano
        </h2>
        <p className="mt-2 font-semibold text-ink">{UNIVERSITY}</p>
        <p className="mt-1 text-sm text-moss">
          Dibuat untuk lomba VETERNITY BERAKSI 2026 (UPN Veteran Yogyakarta), cabang Web Development.
        </p>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {TEAM.map((m) => (
          <div key={m.name} className="rounded-3xl border border-line bg-white p-6 text-center">
            <div className="mx-auto w-fit">
              <Avatar src={m.photo} name={m.name} className="h-20 w-20" textClass="text-2xl" />
            </div>
            <h3 className="mt-4 font-extrabold text-ink">{m.name}</h3>
            <p className="mt-0.5 text-sm text-moss">{m.role}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <div className="mt-14 flex flex-col items-center gap-3 rounded-3xl bg-forest p-8 text-center text-white">
      <Heart className="h-8 w-8" aria-hidden="true" />
      <h2 className="text-xl font-extrabold">Mari bertumbuh bersama warga Manado</h2>
      <p className="max-w-lg text-white/80">
        Cari pekerja tepercaya untuk kebutuhanmu, atau bergabung jadi mitra dan dapatkan penghasilan.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link to="/cari" className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-forest hover:bg-paper">
          Cari Pekerja
        </Link>
        <Link
          to="/daftar/pekerja"
          className="flex items-center gap-1.5 rounded-xl border border-white/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
        >
          Jadi Pekerja <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </div>
);

export default TentangKami;
