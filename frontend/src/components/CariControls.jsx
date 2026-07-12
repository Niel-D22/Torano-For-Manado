import {
  Search,
  MapPin,
  X,
  LayoutGrid,
  Sparkles,
  Hammer,
  Users,
  Wrench,
  Wallet,
  ArrowUpDown,
} from "lucide-react";
import { categories } from "../data/workers";

const catIcons = { art: Sparkles, tukang: Hammer, event: Users, montir: Wrench };

export const jarakOpts = [
  { id: "", label: "Semua jarak", max: Infinity },
  { id: "2", label: "≤ 2 km", max: 2 },
  { id: "5", label: "≤ 5 km", max: 5 },
];
export const hargaOpts = [
  { id: "", label: "Semua harga", max: Infinity },
  { id: "100", label: "≤ Rp100rb", max: 100 },
  { id: "150", label: "≤ Rp150rb", max: 150 },
];
export const sortOpts = [
  { id: "rekomendasi", label: "Rekomendasi" },
  { id: "distance", label: "Terdekat" },
  { id: "rating", label: "Rating tertinggi" },
  { id: "price", label: "Tarif termurah" },
];

const FilterSelect = ({ icon: Icon, value, onChange, options }) => (
  <label className="flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm">
    <Icon className="h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer bg-transparent font-semibold text-ink focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

// Search bar + baris kategori + filter — dipakai di mode grid & panel split.
// State di-bundle via `f` (nilai) + `up` (patch) agar prop ringkas.
const CariControls = ({ f, up, variant = "full" }) => (
  <div>
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-2 shadow-[0_20px_50px_-40px_rgba(13,59,46,0.5)] sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-2 px-3">
        <MapPin className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
        <input
          value={f.lokasi}
          onChange={(e) => up({ lokasi: e.target.value })}
          aria-label="Lokasi"
          className="w-full py-2.5 font-semibold text-ink focus:outline-none"
        />
        {f.lokasi && (
          <button
            type="button"
            onClick={() => up({ lokasi: "" })}
            aria-label="Hapus lokasi"
            className="ring-focus rounded-full p-1 text-moss hover:bg-cloud"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <span className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />
      <div className="flex flex-1 items-center gap-2 px-3">
        <Search className="h-5 w-5 shrink-0 text-moss" aria-hidden="true" />
        <input
          value={f.q}
          onChange={(e) => up({ q: e.target.value })}
          placeholder="Contoh: bersih rumah, tukang listrik, kru acara"
          aria-label="Cari pekerjaan"
          className="w-full py-2.5 text-ink placeholder:text-moss/70 focus:outline-none"
        />
      </div>
      <button
        type="button"
        className="ring-focus shrink-0 rounded-xl bg-ink px-6 py-3 font-bold text-white transition-colors hover:bg-forest"
      >
        {variant === "panel" ? "Cari di area ini" : "Cari Pekerja"}
      </button>
    </div>

    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => up({ cat: "" })}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            f.cat === "" ? "bg-forest text-white" : "border border-line bg-white text-ink hover:border-leaf/60"
          }`}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          Semua
        </button>
        {categories.map((c) => {
          const Icon = catIcons[c.id];
          const active = f.cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => up({ cat: c.id })}
              title={c.label}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                active ? "border-forest bg-limesoft/40 text-ink" : "border-line bg-white text-ink hover:border-leaf/60"
              }`}
            >
              <Icon className="h-4 w-4" style={{ color: c.color }} aria-hidden="true" />
              {c.short}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect icon={MapPin} value={f.jarak} onChange={(v) => up({ jarak: v })} options={jarakOpts} />
        <FilterSelect icon={Wallet} value={f.harga} onChange={(v) => up({ harga: v })} options={hargaOpts} />
        <FilterSelect icon={ArrowUpDown} value={f.sort} onChange={(v) => up({ sort: v })} options={sortOpts} />
      </div>
    </div>
  </div>
);

export default CariControls;
