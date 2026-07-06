import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import WorkerCard from "../components/WorkerCard";
import { categories, workers } from "../data/workers";
import { MapIcon, SearchIcon } from "../components/icons";

const sortOptions = [
  { id: "distance", label: "Terdekat" },
  { id: "rating", label: "Rating tertinggi" },
  { id: "price", label: "Tarif termurah" },
];

const SearchResults = () => {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const katParam = params.get("kat") || "";

  const [activeCat, setActiveCat] = useState(katParam);
  const [sort, setSort] = useState("distance");

  // Sinkronkan filter saat query string berubah (mis. klik kategori dari beranda).
  const [prevKat, setPrevKat] = useState(katParam);
  if (katParam !== prevKat) {
    setPrevKat(katParam);
    setActiveCat(katParam);
  }

  const results = useMemo(() => {
    let list = workers.filter((w) => {
      const matchCat = activeCat ? w.category === activeCat : true;
      const haystack = `${w.name} ${w.skill} ${w.area}`.toLowerCase();
      const matchQ = q ? haystack.includes(q.toLowerCase()) : true;
      return matchCat && matchQ;
    });
    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "price") return a.priceMin - b.priceMin;
      return a.distanceKm - b.distanceKm;
    });
    return list;
  }, [activeCat, q, sort]);

  // Bawa filter aktif ke halaman peta.
  const mapHref = () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (activeCat) p.set("kat", activeCat);
    const s = p.toString();
    return s ? `/peta?${s}` : "/peta";
  };

  return (
    <>
      {/* Header pencarian lengket */}
      <div className="sticky top-14 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <SearchBar size="md" initialQ={q} initialKat={activeCat} />

          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCat("")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
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
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
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

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">
              {results.length} pekerja ditemukan
              {q && <span className="text-moss"> untuk “{q}”</span>}
            </h1>
            <p className="mt-1 text-sm text-moss">
              Tersedia di Kota Manado
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm">
              <span className="hidden text-moss sm:inline">Urutkan</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer bg-transparent font-semibold text-ink focus:outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Masuk ke halaman peta penuh */}
            <Link
              to={mapHref()}
              className="ring-focus flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink"
            >
              <MapIcon className="h-4 w-4" />
              Lihat di Peta
            </Link>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((w, i) => (
              <WorkerCard
                key={w.id}
                worker={w}
                style={{ animationDelay: `${i * 0.04}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-line bg-white py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cloud text-moss">
              <SearchIcon className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-bold text-ink">Belum ada yang cocok</h2>
            <p className="mt-1 max-w-sm text-sm text-moss">
              Coba ganti kata kunci atau pilih kategori lain.
            </p>
            <button
              onClick={() => setActiveCat("")}
              className="mt-5 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink"
            >
              Tampilkan semua pekerja
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default SearchResults;
