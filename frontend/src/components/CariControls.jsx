import { useRef, useState } from "react";
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
  ChevronDown,
  ChevronRight,
  LocateFixed,
} from "lucide-react";
import { categories } from "../data/workers";
import LokasiPickerModal from "./LokasiPickerModal";

const catIcons = { art: Sparkles, tukang: Hammer, event: Users, montir: Wrench };

// Daftar chip kategori memakai label penuh (mengikuti referensi peta).
const chipList = [
  { id: "", label: "Semua Kategori", Icon: LayoutGrid, color: "#0d3b2e" },
  ...categories.map((c) => ({
    id: c.id,
    label: c.label,
    Icon: catIcons[c.id],
    color: c.color,
  })),
];

export const jarakOpts = [
  { id: "", label: "Semua", max: Infinity },
  { id: "2", label: "2 km", max: 2 },
  { id: "5", label: "5 km", max: 5 },
];
export const hargaOpts = [
  { id: "", label: "Semua", max: Infinity },
  { id: "100", label: "≤ 100rb", max: 100 },
  { id: "150", label: "≤ 150rb", max: 150 },
];
export const sortOpts = [
  { id: "rekomendasi", label: "Rekomendasi" },
  { id: "distance", label: "Terdekat" },
  { id: "rating", label: "Rating tertinggi" },
  { id: "price", label: "Tarif termurah" },
];

// Chip kategori bentuk pil — dipakai di sidebar & bilah mengambang atas peta.
export const CategoryChips = ({ value, onChange }) =>
  chipList.map((c) => {
    const active = value === c.id;
    return (
      <button
        key={c.id || "all"}
        type="button"
        onClick={() => onChange(c.id)}
        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold shadow-[0_2px_8px_-4px_rgba(13,59,46,0.35)] transition-colors ${
          active
            ? "border-ink bg-ink text-white"
            : "border-line bg-white text-ink hover:border-forest/50"
        }`}
      >
        <c.Icon
          className="h-4 w-4 shrink-0"
          style={{ color: active ? "#fff" : c.color }}
          aria-hidden="true"
        />
        {c.label}
      </button>
    );
  });

// Baris kategori yang bisa di-scroll horizontal + tombol chevron (tanpa scrollbar).
const CategoryScroller = ({ value, onChange }) => {
  const ref = useRef(null);
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar flex gap-2 overflow-x-auto pr-10">
        <CategoryChips value={value} onChange={onChange} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-white to-transparent" />
      <button
        type="button"
        onClick={() => ref.current?.scrollBy({ left: 220, behavior: "smooth" })}
        aria-label="Kategori lainnya"
        className="ring-focus absolute right-0 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-[0_4px_12px_-4px_rgba(13,59,46,0.35)] hover:border-forest/50"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

const FilterSelect = ({ icon: Icon, prefix, value, onChange, options, grow }) => (
  <label
    className={`flex items-center gap-1 rounded-xl border border-line bg-white px-2.5 py-2 text-[13px] ${
      grow ? "min-w-0 flex-1" : "shrink-0"
    }`}
  >
    <Icon className="h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
    <span className="shrink-0 text-moss">{prefix}:</span>
    <div className="relative min-w-0 flex-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none truncate bg-transparent pr-5 font-semibold text-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-moss"
        aria-hidden="true"
      />
    </div>
  </label>
);

// Search bar + kategori + filter. `panel` = layout sidebar peta (bertumpuk),
// selain itu = mode grid (kategori & filter satu baris).
const CariControls = ({ f, up, variant = "full" }) => {
  const panel = variant === "panel";
  const [pickOpen, setPickOpen] = useState(false);
  return (
    <div>
      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-2 shadow-[0_20px_50px_-40px_rgba(13,59,46,0.5)] sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 px-3">
          <MapPin className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
          <input
            value={f.lokasi}
            onChange={(e) => up({ lokasi: e.target.value, coords: null })}
            aria-label="Lokasi"
            className="w-full py-2.5 font-semibold text-ink focus:outline-none"
          />
          {f.lokasi && (
            <button
              type="button"
              onClick={() => up({ lokasi: "", coords: null })}
              aria-label="Hapus lokasi"
              className="ring-focus rounded-full p-1 text-moss hover:bg-cloud"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setPickOpen(true)}
            aria-label="Tandai lokasi di peta"
            title="Tandai lokasi di peta"
            className={`ring-focus rounded-full p-1.5 transition-colors ${
              f.coords ? "bg-limesoft text-forest" : "text-moss hover:bg-cloud hover:text-forest"
            }`}
          >
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <LokasiPickerModal
          open={pickOpen}
          initial={f.coords}
          onClose={() => setPickOpen(false)}
          onPick={({ lat, lng, label }) =>
            up({ coords: { lat, lng }, lokasi: label || "Titik lokasi saya" })
          }
        />
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
          {panel ? "Cari di area ini" : "Cari Pekerja"}
        </button>
      </div>

      {panel ? (
        // ── Layout sidebar: kategori (scroll) lalu filter, bertumpuk ──
        <>
          <div className="mt-3">
            <CategoryScroller value={f.cat} onChange={(cat) => up({ cat })} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <FilterSelect icon={MapPin} prefix="Jarak" value={f.jarak} onChange={(v) => up({ jarak: v })} options={jarakOpts} />
            <FilterSelect icon={Wallet} prefix="Harga" value={f.harga} onChange={(v) => up({ harga: v })} options={hargaOpts} />
            <FilterSelect icon={ArrowUpDown} prefix="Urutkan" value={f.sort} onChange={(v) => up({ sort: v })} options={sortOpts} grow />
          </div>
        </>
      ) : (
        // ── Mode grid: kategori (kiri) + filter (kanan) satu baris ──
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChips value={f.cat} onChange={(cat) => up({ cat })} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect icon={MapPin} prefix="Jarak" value={f.jarak} onChange={(v) => up({ jarak: v })} options={jarakOpts} />
            <FilterSelect icon={Wallet} prefix="Harga" value={f.harga} onChange={(v) => up({ harga: v })} options={hargaOpts} />
            <FilterSelect icon={ArrowUpDown} prefix="Urutkan" value={f.sort} onChange={(v) => up({ sort: v })} options={sortOpts} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CariControls;
