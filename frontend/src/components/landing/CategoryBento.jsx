import { Link } from "react-router-dom";
import { ArrowRight, Home, Hammer, Users, Wrench } from "lucide-react";
import Reveal from "./Reveal";
import imgArt from "../../assets/Layanan/ART.png";
import imgTukang from "../../assets/Layanan/Tukang.png";
import imgAcara from "../../assets/Layanan/AcaraAdat.png";
import imgMontir from "../../assets/Layanan/montir.png";

const cards = [
  {
    id: "art",
    icon: Home,
    title: "ART & Bersih Rumah",
    body: "Pembersih rumah, laundry, setrika, memasak, dan lainnya.",
    image: imgArt,
  },
  {
    id: "tukang",
    icon: Hammer,
    title: "Tukang Harian",
    body: "Tukang bangunan, cat, kayu, las, dan perbaikan lainnya.",
    image: imgTukang,
  },
  {
    id: "event",
    icon: Users,
    title: "Kru Acara & Adat",
    body: "Kru pesta, dekorasi, sound system, MC, foto & video, dan lainnya.",
    image: imgAcara,
  },
  {
    id: "montir",
    icon: Wrench,
    title: "Montir Panggilan",
    body: "Servis motor, mobil, kelistrikan, dan perawatan lainnya.",
    image: imgMontir,
  },
];

const CategoryBento = () => (
  <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
    <Reveal className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest">
        Kategori populer
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Layanan untuk kebutuhanmu
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-moss">
        Berbagai layanan terpercaya dari pekerja lokal Manado siap membantu kebutuhanmu sehari-hari.
      </p>
    </Reveal>

    <div className="mt-12 grid gap-5 sm:grid-cols-2">
      {cards.map(({ id, icon: Icon, title, body, image }, i) => (
        <Reveal key={id} delay={i * 0.08}>
          <Link
            to={`/cari?kat=${id}`}
            className="group relative block min-h-[280px] overflow-hidden rounded-3xl sm:min-h-[320px] lg:min-h-[360px]"
          >
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 bg-linear-to-t from-ink/95 via-ink/45 to-ink/5"
              aria-hidden="true"
            />
            <div className="relative flex h-full min-h-[280px] flex-col justify-end p-6 sm:min-h-[320px] sm:p-8 lg:min-h-[360px]">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-white text-forest shadow-sm">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="text-2xl font-extrabold text-white sm:text-[1.65rem]">{title}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">{body}</p>
              <span className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest transition-transform group-hover:translate-x-1">
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
