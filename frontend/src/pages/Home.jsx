import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import WorkerCard from "../components/WorkerCard";
import { categories, workers } from "../data/workers";
import {
  SearchIcon,
  ChatIcon,
  WalletIcon,
  ShieldIcon,
  PinIcon,
  ArrowIcon,
} from "../components/icons";

const steps = [
  {
    icon: SearchIcon,
    title: "Cari & pilih",
    body: "Ketik kebutuhanmu, lihat daftar pekerja terdekat lengkap dengan rating dan rekam jejak komunalnya.",
  },
  {
    icon: ChatIcon,
    title: "Chat & sepakati harga",
    body: "Tanya langsung, tawar-menawar dengan wajar, lalu sepakati tarif sebelum pekerjaan dimulai.",
  },
  {
    icon: WalletIcon,
    title: "Kerja beres, bayar aman",
    body: "Dana ditahan sistem sampai pekerjaan selesai. Pekerja pasti dibayar, kamu tenang.",
  },
];

const reasons = [
  {
    icon: ShieldIcon,
    title: "Kepercayaan komunal, bukan sekadar bintang",
    body: "Setiap pekerja dikenali lewat jaringan nyata Manado — RT, jemaat gereja, atau komunitas — bukan cuma ulasan anonim.",
  },
  {
    icon: WalletIcon,
    title: "Jaminan bayar untuk kedua pihak",
    body: "Dana disimpan aman sampai kerja rampung. Menghapus risiko upah tidak dibayar yang sering dialami pekerja harian.",
  },
  {
    icon: PinIcon,
    title: "Semua di sekitarmu",
    body: "Fokus pada tenaga kerja di kawasanmu — Wanea, Sario, Malalayang, Tikala, dan seluruh Kota Manado.",
  },
];

const Home = () => {
  const preview = workers[3]; // Olga Mamahit — rating 5.0

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(163,230,53,0.5), transparent 65%)",
          }}
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-forest">
              <span className="h-2 w-2 rounded-full bg-lime" />
              Tenaga kerja tepercaya di Manado
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Cari tukang, ART,
              <br />
              atau kru acara{" "}
              <span className="text-gradient">yang torang percaya.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-moss">
              Torano mempertemukan warga Manado dengan pekerja harian di
              sekitarnya — dikenali lewat jaringan komunal, disepakati lewat
              chat, dibayar dengan aman.
            </p>

            <div className="mt-8 max-w-xl">
              <SearchBar size="lg" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-moss">Populer:</span>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/cari?kat=${c.id}`}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-leaf hover:bg-cloud"
                >
                  {c.short}
                </Link>
              ))}
            </div>

            <dl className="mt-10 flex gap-8">
              {[
                ["500+", "Pekerja terverifikasi"],
                ["4.9", "Rata-rata rating"],
                ["9", "Kawasan Manado"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-2xl font-extrabold text-ink">{n}</dt>
                  <dd className="text-sm text-moss">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Preview kartu hasil — menegaskan pengalaman "daftar dulu" */}
          <div className="relative animate-rise" style={{ animationDelay: "0.1s" }}>
            <div className="absolute inset-x-6 -bottom-4 h-40 rounded-3xl bg-brand opacity-10 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-3xl border border-line bg-cloud/60 p-4 shadow-[0_40px_80px_-40px_rgba(13,59,39,0.55)]">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-semibold text-ink">
                  Terdekat dari kamu
                </p>
                <span className="text-xs text-moss">Wanea · Sario · Bahu</span>
              </div>
              <WorkerCard worker={preview} />
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-white/70 py-2.5 text-sm font-medium text-forest">
                +140 pekerja lain di sekitarmu
                <ArrowIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KATEGORI ── */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink sm:text-3xl">
                Cari berdasarkan kebutuhan
              </h2>
              <p className="mt-2 text-moss">
                Pilih kategori, langsung lihat daftar orang yang siap membantu.
              </p>
            </div>
            <Link
              to="/cari"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-forest hover:text-ink sm:flex"
            >
              Lihat semua
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => {
              const count = workers.filter((w) => w.category === c.id).length;
              return (
                <Link
                  key={c.id}
                  to={`/cari?kat=${c.id}`}
                  className="group rounded-2xl border border-line bg-paper p-5 transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(13,59,39,0.4)]"
                >
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl text-white"
                    style={{
                      background: `linear-gradient(135deg, ${c.color}, ${c.color}bb)`,
                    }}
                  >
                    <ShieldIcon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-ink">{c.label}</h3>
                  <p className="mt-1 text-sm text-moss">
                    {count * 40}+ pekerja siap
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest opacity-0 transition-opacity group-hover:opacity-100">
                    Lihat daftar <ArrowIcon className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section id="cara-kerja" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="max-w-2xl text-2xl font-bold text-ink sm:text-3xl">
            Dari cari sampai beres, dalam tiga langkah
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-2xl border border-line bg-white p-6"
              >
                <span className="text-sm font-extrabold text-forest">
                  0{i + 1}
                </span>
                <span className="mt-4 grid h-12 w-12 place-items-center rounded-2xl bg-limesoft text-forest">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-moss">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KENAPA TORANO ── */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">
              Kenapa Torano beda
            </h2>
            <p className="mt-2 text-moss">
              Dibangun di atas cara Manado saling percaya — mapalus, bukan
              sekadar transaksi.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reasons.map((r) => (
              <div key={r.title} className="rounded-2xl bg-paper p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-white">
                  <r.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-moss">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pb-20 pt-4 sm:px-6">
        <div className="bg-brand relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-8 py-14 text-center sm:py-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle,#a3e635,transparent 70%)" }}
            aria-hidden="true"
          />
          <h2 className="relative text-3xl font-extrabold text-white sm:text-4xl">
            Butuh bantuan hari ini?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-white/80">
            Temukan tenaga kerja tepercaya di sekitarmu dalam hitungan menit.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/cari"
              className="ring-focus inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              <SearchIcon className="h-5 w-5" />
              Mulai cari sekarang
            </Link>
            <Link
              to="/login"
              className="ring-focus inline-flex items-center rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Daftar jadi pekerja
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
