import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Map, ArrowLeft } from "lucide-react";
import WorkerCard from "../components/WorkerCard";
import MapView from "../components/MapView";
import CariControls, { jarakOpts, hargaOpts, CategoryChips } from "../components/CariControls";
import { api } from "../lib/api";
import { useLayout } from "../lib/layout";

const SearchResults = () => {
  const [params] = useSearchParams();
  const savedCoords = (() => {
    try {
      return JSON.parse(localStorage.getItem("torano_coords") || "null");
    } catch {
      return null;
    }
  })();
  const [f, setF] = useState({
    lokasi: savedCoords ? "Titik lokasi saya" : "Wanea, Manado",
    coords: savedCoords,
    q: params.get("q") || "",
    cat: params.get("kat") || "",
    jarak: "",
    harga: "",
    sort: "rekomendasi",
  });
  const up = (patch) => setF((v) => ({ ...v, ...patch }));

  // Simpan titik lokasi pencari agar melekat antar kunjungan.
  useEffect(() => {
    if (f.coords) localStorage.setItem("torano_coords", JSON.stringify(f.coords));
    else localStorage.removeItem("torano_coords");
  }, [f.coords]);

  // Pekerja terverifikasi dari database (jarak dihitung dari titik lokasi pencari).
  const [workers, setWorkers] = useState([]);
  useEffect(() => {
    const qs = f.coords ? `?lat=${f.coords.lat}&lng=${f.coords.lng}` : "";
    api.get(`/workers${qs}`).then((r) => setWorkers(r.data.data)).catch(() => setWorkers([]));
  }, [f.coords]);

  // null = mode grid; berisi id = mode split (peta terbuka di kanan).
  const [selectedId, setSelectedId] = useState(null);

  // Saat peta terbuka, navbar melebar mentok kiri-kanan (tanpa celah pinggir).
  const { setWide } = useLayout();
  useEffect(() => {
    setWide(!!selectedId);
    return () => setWide(false);
  }, [selectedId, setWide]);

  const maxJarak = jarakOpts.find((o) => o.id === f.jarak).max;
  const maxHarga = hargaOpts.find((o) => o.id === f.harga).max;

  const results = useMemo(() => {
    const list = workers.filter((w) => {
      const byCat = f.cat ? w.category === f.cat : true;
      const byQ = f.q
        ? `${w.name} ${w.skill} ${w.area}`.toLowerCase().includes(f.q.toLowerCase())
        : true;
      return byCat && byQ && w.distanceKm <= maxJarak && w.priceMin <= maxHarga;
    });
    return [...list].sort((a, b) => {
      if (f.sort === "rating") return b.rating - a.rating;
      if (f.sort === "price") return a.priceMin - b.priceMin;
      if (f.sort === "distance") return a.distanceKm - b.distanceKm;
      return b.rating * 10 - a.distanceKm - (a.rating * 10 - b.distanceKm);
    });
  }, [workers, f.cat, f.q, f.sort, maxJarak, maxHarga]);

  const count = (
    <p className="text-sm text-moss">
      Menampilkan <span className="font-bold text-ink">{results.length}</span>{" "}
      pekerja{f.lokasi && ` di ${f.lokasi}`}
    </p>
  );

  return (
    <>
      {/* ── Mode grid (default) ── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <CariControls f={f} up={up} />
        <div className="mt-5">{count}</div>

        {results.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((w, i) => (
              <WorkerCard
                key={w.id}
                worker={w}
                onSelect={setSelectedId}
                style={{ animationDelay: `${i * 0.03}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-line bg-white py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cloud text-moss">
              <Search className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-bold text-ink">Belum ada yang cocok</h2>
            <p className="mt-1 max-w-sm text-sm text-moss">
              Coba ganti kata kunci, kategori, atau longgarkan filter jarak/harga.
            </p>
            <button
              onClick={() => up({ cat: "", jarak: "", harga: "", q: "" })}
              className="mt-5 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink"
            >
              Reset filter
            </button>
          </div>
        )}

        {results.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedId(results[0].id)}
            className="ring-focus fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-bold text-white shadow-[0_20px_50px_-15px_rgba(13,59,46,0.6)] transition-colors hover:bg-forest"
          >
            <Map className="h-5 w-5" aria-hidden="true" />
            Lihat di Peta
          </button>
        )}
      </div>

      {/* ── Mode split: daftar kiri + peta menggeser masuk dari kanan ── */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            key="split"
            className="fixed inset-x-0 bottom-0 top-14 z-30 flex overflow-hidden bg-paper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Kiri: kontrol + daftar */}
            <div className="flex w-full flex-col lg:w-[46%] xl:w-[42%]">
              <div className="border-b border-line px-4 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="ring-focus mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-moss hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Kembali ke daftar
                </button>
                <CariControls f={f} up={up} variant="panel" />
              </div>
              <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
                <p className="text-sm text-moss">
                  Menampilkan{" "}
                  <span className="font-bold text-ink">{results.length}</span>{" "}
                  pekerja di area ini
                </p>
                {results.map((w) => (
                  <WorkerCard
                    key={w.id}
                    worker={w}
                    compact
                    selected={w.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            </div>

            {/* Kanan: peta yang menggeser masuk */}
            <motion.div
              className="relative hidden flex-1 lg:block"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <MapView workers={results} selectedId={selectedId} onSelect={setSelectedId} origin={f.coords} />

              {/* Bilah kategori mengambang di atas peta (mengikuti referensi) */}
              <div className="no-scrollbar absolute inset-x-0 top-0 z-[1000] flex gap-2 overflow-x-auto px-4 py-3">
                <CategoryChips value={f.cat} onChange={(cat) => up({ cat })} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchResults;
