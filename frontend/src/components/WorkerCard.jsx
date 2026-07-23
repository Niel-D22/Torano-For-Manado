import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, ShieldCheck, Heart, Sparkles, Hammer, Users, Wrench, BadgeCheck } from "lucide-react";
import { categoryMap } from "../data/workers";
import { workerPhotos } from "../assets/workers/photos";
import { useAuthGate } from "../lib/auth";

const catIcons = { art: Sparkles, tukang: Hammer, event: Users, montir: Wrench };

// Kartu pekerja — layout horizontal (foto kiri, detail kanan) mengikuti mockup.
// Dipakai di halaman Cari & sidebar Peta (onSelect/selected untuk sorotan peta).
const WorkerCard = ({ worker, style, selected = false, onSelect, compact = false }) => {
  const cat = categoryMap[worker.category];
  const CatIcon = catIcons[worker.category];
  const navigate = useNavigate();
  const gate = useAuthGate();
  const [fav, setFav] = useState(false);

  const open = () =>
    onSelect ? onSelect(worker.id) : navigate(`/pekerja/${worker.id}`);

  // Favorit butuh login → gerbang dulu, baru toggle.
  const toggleFav = (e) => {
    e.stopPropagation();
    gate(() => setFav((v) => !v));
  };

  // Varian ringkas (sidebar peta) — tata letak 3 kolom seperti mockup:
  // foto · detail (nama/kategori/rating/jarak) · status+harga+trust+favorit.
  if (compact) {
    return (
      <article
        style={style}
        onClick={open}
        className={`animate-rise flex cursor-pointer gap-3 rounded-2xl border bg-white p-3 transition-all duration-200 ${
          selected
            ? "border-forest ring-2 ring-forest/25"
            : "border-line hover:border-forest/40 hover:shadow-[0_16px_36px_-24px_rgba(13,59,46,0.45)]"
        }`}
      >
        <img
          src={workerPhotos[worker.id]}
          alt={worker.name}
          loading="lazy"
          className="h-[86px] w-[86px] shrink-0 rounded-xl object-cover"
        />

        {/* Kolom tengah: identitas */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="flex items-center gap-1 truncate text-[15px] font-extrabold text-ink">
            <span className="truncate">{worker.name}</span>
            <BadgeCheck className="h-4 w-4 shrink-0 text-forest" aria-label="Terverifikasi" />
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-moss">
            <CatIcon className="h-3.5 w-3.5 shrink-0" style={{ color: cat.color }} aria-hidden="true" />
            <span className="truncate">{cat.label}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px]">
            <Star className="h-3.5 w-3.5 shrink-0 fill-sun text-sun" aria-hidden="true" />
            <span className="font-bold text-ink">{worker.rating.toFixed(1)}</span>
            <span className="text-moss">({worker.jobs} jobs)</span>
          </p>
          <p className="mt-auto flex items-center gap-1.5 pt-1 text-[13px] text-moss">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-forest" aria-hidden="true" />
            {worker.distanceKm.toFixed(1)} km · {worker.area}
          </p>
        </div>

        {/* Kolom kanan: status, harga, trust, favorit */}
        <div className="flex shrink-0 flex-col items-end text-right">
          {worker.available ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest">
              <span className="h-1.5 w-1.5 rounded-full bg-forest" />
              Tersedia
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-moss">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" />
              Sibuk
            </span>
          )}
          <p className="mt-1.5 text-[15px] font-extrabold leading-tight text-forest">
            Rp{worker.priceMin}–{worker.priceMax}rb
            <span className="text-xs font-semibold text-moss">/jam</span>
          </p>
          <p className="mt-2 flex max-w-[112px] items-start justify-end gap-1 text-[11px] leading-tight text-moss">
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-sun" aria-hidden="true" />
            <span>{worker.trust}</span>
          </p>
          <button
            type="button"
            onClick={toggleFav}
            aria-label={fav ? "Hapus dari favorit" : "Simpan ke favorit"}
            aria-pressed={fav}
            className="ring-focus mt-auto grid h-8 w-8 place-items-center rounded-full text-moss transition-colors hover:text-forest"
          >
            <Heart className={`h-[18px] w-[18px] ${fav ? "fill-red-500 text-red-500" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      style={style}
      onClick={open}
      className={`animate-rise flex cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
        selected
          ? "border-forest ring-2 ring-forest/25"
          : "border-line hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(13,59,46,0.45)]"
      }`}
    >
      <img
        src={workerPhotos[worker.id]}
        alt={worker.name}
        loading="lazy"
        className="w-32 shrink-0 object-cover sm:w-36"
      />

      <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            {worker.available ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-limesoft/70 px-2.5 py-1 text-xs font-semibold text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                Tersedia
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cloud px-2.5 py-1 text-xs font-semibold text-moss">
                <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                Sibuk
              </span>
            )}
            <button
              type="button"
              onClick={toggleFav}
              aria-label={fav ? "Hapus dari favorit" : "Simpan ke favorit"}
              aria-pressed={fav}
              className="ring-focus grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-moss transition-colors hover:border-forest hover:text-forest"
            >
              <Heart className={`h-4 w-4 ${fav ? "fill-red-500 text-red-500" : ""}`} aria-hidden="true" />
            </button>
          </div>

          <h3 className="mt-2 truncate text-lg font-extrabold text-ink">{worker.name}</h3>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-moss">
            <CatIcon className="h-4 w-4 shrink-0" style={{ color: cat.color }} aria-hidden="true" />
            <span className="truncate">{cat.label}</span>
          </p>

          <p className="mt-1.5 flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-sun text-sun" aria-hidden="true" />
            <span className="font-bold text-ink">{worker.rating.toFixed(1)}</span>
            <span className="text-moss">({worker.jobs} jobs)</span>
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-moss">
            <MapPin className="h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
            {worker.distanceKm.toFixed(1)} km · {worker.area}
          </p>

          <p className="mt-1.5 font-extrabold text-forest">
            Rp{worker.priceMin}–{worker.priceMax}rb
            <span className="text-sm font-semibold text-moss"> / jam</span>
          </p>

          <p className="mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-xs text-moss">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sun" aria-hidden="true" />
            <span className="truncate">{worker.trust}</span>
          </p>
      </div>
    </article>
  );
};

export default WorkerCard;
