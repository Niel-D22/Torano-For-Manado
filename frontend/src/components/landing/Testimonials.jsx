import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import PhotoFrame from "./PhotoFrame";
import Reveal from "./Reveal";
import { landingPhotos } from "./assets";

// Testimoni warga — kartu polaroid berfoto dengan kutipan serif besar di
// tengah, persis desain final. Panah menggeser urutan kartu.
const testimonials = [
  {
    name: "Feby Lumentut",
    area: "Wanea",
    text: "ART dari Torano sangat membantu keluarga saya. Rajin, jujur, dan sudah seperti keluarga sendiri.",
    photo: landingPhotos.testiFeby,
    photoLabel: "Foto: ART memasak",
  },
  {
    name: "Ricky Mokodompit",
    area: "Paal Dua",
    text: "Tukang bangunannya profesional dan pekerjaannya rapi. Nego harga juga mudah di aplikasi.",
    photo: landingPhotos.testiRicky,
    photoLabel: "Foto: tukang kayu",
  },
  {
    name: "Jefri K.",
    area: "Mapanget",
    text: "Montirnya datang tepat waktu, jelas jelasin masalahnya. Recommended!",
    photo: landingPhotos.testiJefri,
    photoLabel: "Foto: montir",
  },
];

const Stars = () => (
  <div className="flex gap-0.5" aria-label="Rating 5 dari 5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className="h-4 w-4 fill-sun text-sun" aria-hidden="true" />
    ))}
  </div>
);

const TestimonialCard = ({ item, className = "" }) => (
  <figure
    className={`rounded-2xl bg-white p-3 pb-4 shadow-[0_24px_50px_-30px_rgba(13,59,46,0.35)] transition-transform ${className}`}
  >
    <PhotoFrame
      src={item.photo}
      alt={`${item.name} dibantu pekerja Torano`}
      label={item.photoLabel}
      className="h-32 w-full rounded-xl"
    />
    <div className="px-1.5">
      <div className="mt-3">
        <Stars />
      </div>
      <blockquote className="mt-2 text-xs leading-relaxed text-ink">
        {item.text}
      </blockquote>
      <figcaption className="mt-3">
        <p className="text-sm font-extrabold text-ink">{item.name}</p>
        <p className="text-xs text-moss">{item.area}</p>
      </figcaption>
    </div>
  </figure>
);

const Testimonials = () => {
  // Panah menggeser kartu secara berputar
  const [offset, setOffset] = useState(0);
  const at = (i) => testimonials[(offset + i + testimonials.length * 10) % testimonials.length];

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
      <div className="grid items-start gap-10 lg:grid-cols-[0.75fr_1fr_1.15fr_1fr_1fr]">
        {/* Judul di kiri, sejajar dengan kartu */}
        <Reveal>
          <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-ink">
            Apa kata
            <br />
            warga Manado
          </h2>
          <span
            className="mt-2 inline-block h-1.5 w-14 rounded-full bg-sun"
            aria-hidden="true"
          />
        </Reveal>

        <Reveal delay={0.05}>
          <TestimonialCard item={at(0)} className="lg:-rotate-2" />
        </Reveal>

        {/* Kutipan besar sebagai jangkar visual section */}
        <Reveal delay={0.12} className="self-center text-center">
          <blockquote className="font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
            “Praktis, aman, dan bisa diandalkan!”
          </blockquote>
          <p className="mt-4 text-xs font-semibold text-moss">
            — Meiske Tampi
            <br />
            Malalayang
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <TestimonialCard item={at(1)} className="lg:rotate-1" />
        </Reveal>

        <Reveal delay={0.24}>
          <TestimonialCard item={at(2)} className="lg:translate-y-6 lg:rotate-2" />
        </Reveal>
      </div>

      {/* Panah pengganti urutan kartu */}
      <Reveal delay={0.2} className="mt-12 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setOffset((o) => o - 1)}
          aria-label="Testimoni sebelumnya"
          className="ring-focus grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-ink hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setOffset((o) => o + 1)}
          aria-label="Testimoni berikutnya"
          className="ring-focus grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-ink hover:text-white"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </Reveal>
    </section>
  );
};

export default Testimonials;
