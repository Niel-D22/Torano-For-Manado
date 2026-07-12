import { Star, BadgeCheck } from "lucide-react";
import SearchBar from "../SearchBar";
import PhotoFrame from "./PhotoFrame";
import Reveal from "./Reveal";
import { landingPhotos, bgHero } from "./assets";

// Chip kecil melayang di atas kolase foto
const FloatChip = ({ className, children }) => (
  <div
    className={`absolute z-10 flex items-center gap-2 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-[0_16px_40px_-16px_rgba(13,59,46,0.35)] backdrop-blur ${className}`}
  >
    {children}
  </div>
);

const avatarTones = ["#16a34a", "#ca8a04", "#0d3b2e", "#6b7280"];

const Hero = () => (
  <section className="relative overflow-hidden">
    {/* Lukisan cat air Manado sebagai latar, menjangkar di bawah */}
    <img
      src={bgHero}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
    />
    {/* Lelehkan tepi bawah lukisan ke warna halaman — tanpa garis pemisah */}
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-paper"
      aria-hidden="true"
    />

    <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32 lg:pt-24">
      {/* ── Kiri: pesan utama + pencarian ── */}
      <Reveal>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun/15 px-3 py-1.5 text-xs font-bold text-[#8a6a00]">
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          #1 Platform Pekerja Lokal di Manado
        </span>

        <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
          Cari pekerja terpercaya di{" "}
          <span className="relative inline-block">
            sekitarmu
            <span
              className="absolute inset-x-0 -bottom-1 h-1.5 rounded-full bg-sun"
              aria-hidden="true"
            />
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-moss">
          ART, tukang, kru acara, dan montir panggilan — dikenal dan dipercaya
          warga Manado.
        </p>

        <div className="mt-8 max-w-xl">
          <SearchBar size="lg" />
        </div>

        {/* Bukti sosial: warga yang sudah terbantu */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex -space-x-2" aria-hidden="true">
            {avatarTones.map((tone) => (
              <span
                key={tone}
                className="h-8 w-8 rounded-full border-2 border-white"
                style={{ backgroundColor: tone }}
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-ink">
            10.000+ warga Manado{" "}
            <span className="font-normal text-moss">sudah terbantu</span>
          </p>
        </div>
      </Reveal>

      {/* ── Kanan: kolase foto pekerja + chip kepercayaan ── */}
      <Reveal delay={0.15} className="relative hidden lg:block">
        <FloatChip className="-left-4 top-2">
          <Star className="h-5 w-5 fill-sun text-sun" aria-hidden="true" />
          <div>
            <p className="text-sm font-extrabold leading-none text-ink">4.9</p>
            <p className="text-[11px] text-moss">(132 ulasan)</p>
          </div>
        </FloatChip>

        <FloatChip className="-bottom-5 left-10">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-white">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm font-bold text-ink">Dikenal warga RT 03</p>
        </FloatChip>

        <FloatChip className="-right-2 top-32 max-w-[210px]">
          <span
            className="h-7 w-7 shrink-0 rounded-full bg-forest/20"
            aria-hidden="true"
          />
          <p className="text-xs leading-snug text-ink">
            <span className="font-bold">Saya menuju lokasi 🙏</span>
            <br />
            <span className="text-moss">5 menit lagi sampai!</span>
          </p>
        </FloatChip>

        {/* Tiga foto dalam bentuk organik, saling bertaut */}
        <div className="grid grid-cols-2 gap-4">
          <PhotoFrame
            src={landingPhotos.heroTukang}
            alt="Tukang sedang memplester tembok"
            label="Foto: tukang memplester"
            className="col-start-2 h-52 w-full rounded-[46%_54%_52%_48%/60%_48%_52%_40%]"
          />
          <PhotoFrame
            src={landingPhotos.heroArt}
            alt="ART melipat kain di dekat jendela"
            label="Foto: ART melipat kain"
            className="row-start-2 h-60 w-full rounded-[52%_48%_44%_56%/48%_56%_44%_52%]"
          />
          <PhotoFrame
            src={landingPhotos.heroMontir}
            alt="Montir memperbaiki sepeda motor"
            label="Foto: montir bekerja"
            className="col-start-2 row-start-2 h-52 w-full rounded-[48%_52%_56%_44%/52%_44%_56%_48%]"
          />
        </div>
      </Reveal>
    </div>
  </section>
);

export default Hero;
