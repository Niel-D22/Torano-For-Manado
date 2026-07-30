import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MapView from "../components/MapView";
import { categories, categoryMap, workers } from "../data/workers";
import { ArrowIcon, PinIcon } from "../components/icons";

const MapPage = () => {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const katParam = params.get("kat") || "";

  const [activeCat, setActiveCat] = useState(katParam);
  const [selectedId, setSelectedId] = useState(null);

  const results = useMemo(
    () =>
      workers.filter((w) => {
        const matchCat = activeCat ? w.category === activeCat : true;
        const haystack = `${w.name} ${w.skill} ${w.area}`.toLowerCase();
        const matchQ = q ? haystack.includes(q.toLowerCase()) : true;
        return matchCat && matchQ;
      }),
    [activeCat, q],
  );

  const backHref = () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (activeCat) p.set("kat", activeCat);
    const s = p.toString();
    return s ? `/cari?${s}` : "/cari";
  };

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <MapView
        workers={results}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Panel kontrol melayang */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] px-4 py-4 sm:px-6">
        <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-line bg-white/95 p-4 shadow-[0_24px_50px_-24px_rgba(13,59,46,0.5)] backdrop-blur">
          <Link
            to={backHref()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss transition-colors hover:text-ink"
          >
            <ArrowIcon className="h-4 w-4 rotate-180" />
            Kembali ke daftar
          </Link>

          <h1 className="mt-2 flex items-center gap-2 text-lg font-extrabold text-ink">
            <PinIcon className="h-5 w-5 text-forest" />
            Peta pekerja · Manado
          </h1>
          <p className="text-sm text-moss">
            {results.length} pekerja tersedia
            {q && <span> untuk “{q}”</span>} · ketuk pin untuk detail
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat("")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeCat === ""
                  ? "bg-forest text-white"
                  : "border border-line bg-white text-moss hover:text-ink"
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeCat === c.id
                    ? "text-white"
                    : "border border-line bg-white text-moss hover:text-ink"
                }`}
                style={activeCat === c.id ? { background: c.color } : undefined}
              >
                {c.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda kategori */}
      <div className="pointer-events-none absolute bottom-6 left-4 z-[1000] sm:left-6">
        <div className="pointer-events-auto rounded-xl border border-line bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-moss">
            Kategori
          </p>
          <div className="flex flex-col gap-1.5">
            {categories.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-2 text-xs font-medium text-ink"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: c.color }}
                />
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
