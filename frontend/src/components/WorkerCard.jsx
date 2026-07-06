import { Link } from "react-router-dom";
import { categoryMap } from "../data/workers";
import { StarIcon, PinIcon, ShieldIcon, ArrowIcon } from "./icons";

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const WorkerCard = ({ worker, style, selected = false, onSelect }) => {
  const cat = categoryMap[worker.category];

  return (
    <article
      style={style}
      onClick={onSelect ? () => onSelect(worker.id) : undefined}
      className={`animate-rise flex flex-col rounded-2xl border bg-white p-5 transition-all duration-200 ${
        onSelect ? "cursor-pointer" : ""
      } ${
        selected
          ? "border-forest ring-2 ring-forest/25"
          : "border-line hover:-translate-y-1 hover:border-leaf/40 hover:shadow-[0_24px_50px_-28px_rgba(13,59,46,0.45)]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
          }}
          aria-hidden="true"
        >
          {initials(worker.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-bold text-ink">{worker.name}</h3>
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink">
              <StarIcon className="h-4 w-4 text-sun" />
              {worker.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-moss">{worker.skill}</p>
          <span
            className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ color: cat.color, background: `${cat.color}14` }}
          >
            {cat.short}
          </span>
        </div>
      </div>

      {/* Signature: badge kepercayaan komunal — inti pembeda Torano */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-limesoft/60 px-3 py-2.5 text-forest">
        <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-xs font-medium leading-snug">{worker.trust}</p>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-moss">
        <span className="flex items-center gap-1.5">
          <PinIcon className="h-4 w-4 text-leaf" />
          {worker.area} · {worker.distanceKm.toFixed(1)} km
        </span>
        <span aria-hidden="true">·</span>
        <span>{worker.jobs} kerja selesai</span>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
        <div>
          <p className="text-xs text-moss">Kisaran tarif</p>
          <p className="font-bold text-ink">
            Rp{worker.priceMin}–{worker.priceMax}rb
            <span className="text-xs font-medium text-moss"> /hari</span>
          </p>
        </div>
        <Link
          to={`/pekerja/${worker.id}`}
          onClick={(e) => e.stopPropagation()}
          className="ring-focus flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-forest transition-colors duration-200 hover:border-forest hover:bg-forest hover:text-white"
        >
          Lihat Profil
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

export default WorkerCard;
