import { motion } from "framer-motion";
import { Star, BadgeCheck, ShieldCheck, Lock, MapPin } from "lucide-react";
import SearchBar from "../SearchBar";
import PhotoFrame from "./PhotoFrame";
import { staggerContainer, fadeUpItem, popItem } from "./Reveal";
import { landingPhotos, bgHero } from "./assets";

// Chip melayang di atas kolase; ikut animasi cascade (varian popItem).
const FloatChip = ({ className, children }) => (
  <motion.div
    variants={popItem}
    className={`absolute z-10 flex items-center gap-2 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-[0_16px_40px_-16px_rgba(13,59,46,0.35)] backdrop-blur ${className}`}
  >
    {children}
  </motion.div>
);

const trust = [
  [ShieldCheck, "Mitra terverifikasi"],
  [Lock, "Pembayaran ditahan"],
  [MapPin, "Khusus Manado"],
];

const Hero = () => (
  <section className="relative overflow-hidden">
    {/* Lukisan cat air Manado sebagai latar, menjangkar di bawah */}
    <img
      src={bgHero}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
    />
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-paper"
      aria-hidden="true"
    />

    <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32 lg:pt-24">
      {/* ── Kiri: cascade masuk saat halaman dibuka ── */}
      <motion.div variants={staggerContainer(0.1, 0.15)} initial="hidden" animate="show">
        <motion.span
          variants={fadeUpItem}
          className="inline-flex items-center gap-1.5 rounded-full bg-sun/15 px-3 py-1.5 text-xs font-bold text-[#8a6a00]"
        >
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          Platform Pekerja Lokal di Manado
        </motion.span>

        <motion.h1
          variants={fadeUpItem}
          className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]"
        >
          Cari pekerja terpercaya di{" "}
          <span className="relative inline-block">
            sekitarmu
            <span className="absolute inset-x-0 -bottom-1 h-1.5 rounded-full bg-sun" aria-hidden="true" />
          </span>
        </motion.h1>

        <motion.p variants={fadeUpItem} className="mt-5 max-w-xl text-lg text-moss">
          ART, tukang, kru acara, dan montir panggilan — dikenal dan dipercaya warga Manado.
        </motion.p>

        <motion.div variants={fadeUpItem} className="mt-8 max-w-xl">
          <SearchBar size="lg" />
        </motion.div>

        <motion.div variants={fadeUpItem} className="mt-7 flex flex-wrap gap-2.5">
          {trust.map(([Icon, label]) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1.5 text-sm font-semibold text-ink backdrop-blur"
            >
              <Icon className="h-4 w-4 text-forest" aria-hidden="true" />
              {label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Kanan: kolase foto muncul berurutan ── */}
      <div className="relative hidden lg:block">
        <motion.div
          className="relative mx-auto aspect-square w-full max-w-[480px]"
          variants={staggerContainer(0.14, 0.3)}
          initial="hidden"
          animate="show"
        >
          {/* ART — utama, kiri tengah */}
          <motion.div
            variants={popItem}
            className="absolute left-0 top-[22%] h-[54%] w-[60%]"
          >
            <PhotoFrame
              src={landingPhotos.heroArt}
              alt="Ilustrasi ART merapikan rumah"
              label="Ilustrasi ART"
              className="h-full w-full rounded-[46%_54%_52%_48%/52%_46%_54%_48%] object-cover shadow-[0_30px_60px_-25px_rgba(13,59,46,0.5)] ring-[6px] ring-paper"
            />
          </motion.div>
          {/* Tukang — kanan atas */}
          <motion.div variants={popItem} className="absolute right-0 top-0 h-[48%] w-[54%]">
            <PhotoFrame
              src={landingPhotos.heroTukang}
              alt="Ilustrasi tukang memplester tembok"
              label="Ilustrasi tukang"
              className="h-full w-full rounded-[52%_48%_46%_54%/48%_54%_46%_52%] object-cover shadow-[0_30px_60px_-25px_rgba(13,59,46,0.5)] ring-[6px] ring-paper"
            />
          </motion.div>
          {/* Montir — kanan bawah */}
          <motion.div variants={popItem} className="absolute bottom-0 right-[2%] h-[48%] w-[54%]">
            <PhotoFrame
              src={landingPhotos.heroMontir}
              alt="Ilustrasi montir servis motor"
              label="Ilustrasi montir"
              className="h-full w-full rounded-[50%_50%_54%_46%/54%_48%_52%_46%] object-cover shadow-[0_30px_60px_-25px_rgba(13,59,46,0.5)] ring-[6px] ring-paper"
            />
          </motion.div>

          {/* Chip melayang (cascade setelah foto) */}
          <FloatChip className="left-[-2%] top-[6%]">
            <Star className="h-5 w-5 fill-sun text-sun" aria-hidden="true" />
            <div>
              <p className="text-sm font-extrabold leading-none text-ink">4.9</p>
              <p className="text-[11px] text-moss">(132 ulasan)</p>
            </div>
          </FloatChip>

          <FloatChip className="right-[4%] top-[36%] z-20 max-w-[220px]">
            <span className="h-7 w-7 shrink-0 rounded-full bg-forest/20" aria-hidden="true" />
            <p className="text-xs leading-snug text-ink">
              <span className="font-bold">Saya menuju lokasi</span>
              <br />
              <span className="text-moss">5 menit lagi sampai!</span>
            </p>
          </FloatChip>

          <FloatChip className="bottom-[6%] left-[2%] z-20">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-white">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-sm font-bold text-ink">Dikenal warga RT 03</p>
          </FloatChip>
        </motion.div>
      </div>
    </div>
  </section>
);

export default Hero;
