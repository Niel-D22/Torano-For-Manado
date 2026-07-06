import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../data/workers";
import { SearchIcon } from "./icons";

// Bar pencarian dipakai di hero (size "lg") dan di header hasil (size "md").
const SearchBar = ({ initialQ = "", initialKat = "", size = "lg" }) => {
  const [q, setQ] = useState(initialQ);
  const [kat, setKat] = useState(initialKat);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (kat) params.set("kat", kat);
    navigate(`/cari?${params.toString()}`);
  };

  const pad = size === "lg" ? "p-2" : "p-1.5";
  const inputPad = size === "lg" ? "py-3.5 text-base" : "py-2.5 text-sm";

  return (
    <form
      onSubmit={submit}
      className={`flex w-full flex-col gap-2 rounded-2xl border border-line bg-white ${pad} shadow-[0_18px_50px_-24px_rgba(13,59,39,0.5)] sm:flex-row sm:items-center sm:gap-0`}
    >
      <div className="flex flex-1 items-center gap-3 px-3">
        <SearchIcon className="h-5 w-5 shrink-0 text-leaf" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Mau cari apa? cth: tukang cat, ART, montir motor"
          aria-label="Kata kunci pencarian"
          className={`w-full bg-transparent text-ink placeholder:text-moss/70 focus:outline-none ${inputPad}`}
        />
      </div>

      <div className="hidden w-px self-stretch bg-line sm:block" />

      <select
        value={kat}
        onChange={(e) => setKat(e.target.value)}
        aria-label="Pilih kategori"
        className={`cursor-pointer rounded-xl bg-cloud px-4 font-medium text-ink focus:outline-none sm:rounded-none sm:bg-transparent ${inputPad}`}
      >
        <option value="">Semua kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.short}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="ring-focus flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-transform duration-200 hover:bg-ink active:scale-[0.98]"
      >
        <SearchIcon className="h-4 w-4" />
        Cari
      </button>
    </form>
  );
};

export default SearchBar;
