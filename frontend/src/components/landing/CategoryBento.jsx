import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Hammer, Users, Wrench } from "lucide-react";
import PhotoFrame from "./PhotoFrame";
import Reveal from "./Reveal";
import { landingPhotos } from "./assets";

// Bento grid kategori — ukuran kartu sengaja tidak seragam (editorial).
const cards = [
  {
    id: "art",
    icon: Sparkles,
    title: "ART & Bersih Rumah",
    body: "Pembersih rumah, cuci setrika, masak harian, dan lainnya",
    photo: landingPhotos.catArt,
    photoLabel: "Foto: ART merapikan kamar",
    className: "lg:row-span-2 min-h-72 lg:min-h-0",
  },
  {
    id: "tukang",
    icon: Hammer,
    title: "Tukang Harian",
    body: "Tukang bangunan, cat, kayu, las, dan perbaikan lainnya",
    photo: landingPhotos.catTukang,
    photoLabel: "Foto: tukang kayu bekerja",
    className: "min-h-56",
  },
  {
    id: "event",
    icon: Users,
    title: "Kru Acara & Adat",
    body: "Kru pesta, dekorasi, sound, MC, foto & video, dsb.",
    photo: landingPhotos.catEvent,
    photoLabel: "Foto: kru acara menyiapkan sound",
    className: "min-h-56",
  },
  {
    id: "montir",
    icon: Wrench,
    title: "Montir Panggilan",
    body: "Servis motor, mobil, kelistrikan, dan perawatan lainnya",
    photo: landingPhotos.catMontir,
    photoLabel: "Foto: montir servis motor",
    className: "lg:col-span-2 min-h-56",
  },
];

const CategoryBento = () => (
  <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
    <Reveal className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-moss">
        Kategori populer
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Layanan untuk kebutuhanmu
      </h2>
    </Reveal>

    <div className="mt-12 grid gap-4 lg:grid-cols-3">
      {cards.map(({ id, icon: Icon, title, body, photo, photoLabel, className }, i) => (
        <Reveal key={id} delay={i * 0.08} className={className}>
          <Link
            to={`/cari?kat=${id}`}
            className="group relative block h-full overflow-hidden rounded-3xl bg-ink"
          >
            <PhotoFrame
              src={photo}
              alt={title}
              label={photoLabel}
              className="absolute inset-0 h-full w-full opacity-80 transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradasi gelap agar teks selalu terbaca di atas foto */}
            <div
              className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/30 to-transparent"
              aria-hidden="true"
            />
            <div className="relative flex h-full flex-col justify-end p-6">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white backdrop-blur">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-xl font-extrabold text-white">{title}</h3>
              <p className="mt-1 max-w-xs text-sm text-white/80">{body}</p>
              <span className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  </section>
);

export default CategoryBento;
