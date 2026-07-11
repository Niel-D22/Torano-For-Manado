import { Search, Star, Check } from "lucide-react";
import Reveal from "./Reveal";

// "Cara Kerja" — zigzag 3 langkah. Kartu di tiap langkah adalah
// replika mini UI produk (bukan gambar) supaya tajam di semua layar.

const MiniAvatar = ({ tone, initial }) => (
  <span
    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white"
    style={{ backgroundColor: tone }}
    aria-hidden="true"
  >
    {initial}
  </span>
);

// Langkah 1 — replika mini hasil pencarian
const MiniSearchCard = () => (
  <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-4 shadow-[0_30px_60px_-30px_rgba(13,59,46,0.4)]">
    <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2">
      <Search className="h-4 w-4 text-moss" aria-hidden="true" />
      <span className="flex-1 text-sm text-moss">Wanea, Manado</span>
      <span className="rounded-lg bg-ink px-3 py-1 text-xs font-bold text-white">
        Cari
      </span>
    </div>
    <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-moss">
      Rekomendasi untukmu
    </p>
    {[
      ["S", "#16a34a", "Siti A.", "ART & Bersih Rumah", "4.9 · 1.2 km", "Rp25.000/jam"],
      ["J", "#ca8a04", "Joko T.", "Tukang Harian", "4.8 · 1.4 km", "Rp80.000/jam"],
    ].map(([initial, tone, name, cat, meta, price]) => (
      <div key={name} className="mt-2 flex items-center gap-3 rounded-xl border border-line p-2.5">
        <MiniAvatar tone={tone} initial={initial} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">{name}</p>
          <p className="truncate text-xs text-moss">
            {cat} · <Star className="inline h-3 w-3 fill-sun text-sun" aria-hidden="true" /> {meta}
          </p>
        </div>
        <p className="text-xs font-extrabold text-ink">{price}</p>
      </div>
    ))}
  </div>
);

// Langkah 2 — replika mini chat dengan tawaran diterima
const MiniChatCard = () => (
  <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-4 shadow-[0_30px_60px_-30px_rgba(13,59,46,0.4)]">
    <div className="flex items-center gap-2 border-b border-line pb-2.5">
      <MiniAvatar tone="#16a34a" initial="S" />
      <div>
        <p className="text-sm font-bold text-ink">Siti A.</p>
        <p className="text-[11px] font-semibold text-forest">Online</p>
      </div>
    </div>
    <div className="mt-3 space-y-2 text-xs">
      <p className="w-fit max-w-[85%] rounded-2xl rounded-tl-md bg-cloud px-3 py-2 text-ink">
        Selamat pagi Bu, bisa bantu beres-beres rumah 3 jam hari ini?
      </p>
      <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-forest px-3 py-2 text-white">
        Bisa, Bu 🙏 Rp75.000 untuk 3 jam ya.
      </p>
      <div className="rounded-xl border border-sun/60 bg-sun/10 p-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-ink">Tawaran diterima</p>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-forest text-white">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-1 text-lg font-extrabold text-ink">Rp75.000</p>
        <p className="text-[11px] text-moss">Pembayaran aman di Torano</p>
      </div>
    </div>
  </div>
);

// Langkah 3 — replika mini form ulasan
const MiniReviewCard = () => (
  <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-4 shadow-[0_30px_60px_-30px_rgba(13,59,46,0.4)]">
    <div className="flex items-center gap-2">
      <MiniAvatar tone="#16a34a" initial="S" />
      <p className="text-sm font-bold text-ink">Beri ulasan untuk Siti A.</p>
    </div>
    <div className="mt-3 flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className="h-6 w-6 fill-sun text-sun" />
      ))}
    </div>
    <p className="mt-3 rounded-xl border border-line bg-paper px-3 py-2 text-xs text-moss">
      Pekerjaan rapi dan cepat, terima kasih Bu Siti 🙏
    </p>
    <button
      type="button"
      tabIndex={-1}
      className="mt-3 w-full rounded-xl bg-ink py-2.5 text-xs font-bold text-white"
    >
      Kirim Ulasan
    </button>
  </div>
);

const steps = [
  {
    number: "01",
    title: "Cari & pilih pekerja di dekatmu",
    body: "Temukan pekerja berdasarkan lokasi, keahlian, rating, dan ulasan warga.",
    Card: MiniSearchCard,
  },
  {
    number: "02",
    title: "Chat, nego harga, dan bayar aman di aplikasi",
    body: "Komunikasi mudah, setujui harga, pembayaran ditahan aman di Torano.",
    Card: MiniChatCard,
  },
  {
    number: "03",
    title: "Kerjaan beres, beri ulasan",
    body: "Pekerjaan selesai, pembayaran dilepas ke pekerja, dan beri ulasan.",
    Card: MiniReviewCard,
  },
];

const HowItWorks = () => (
  <section className="py-24 lg:py-32">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-moss">
          Cara kerja
        </p>
        <h2 className="mt-3 max-w-sm text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Mudah dalam 3 langkah
        </h2>
      </Reveal>

      <div className="mt-16 space-y-20 lg:space-y-28">
        {steps.map(({ number, title, body, Card }, i) => {
          const flipped = i % 2 === 1;
          return (
            <Reveal key={number}>
              <div
                className={`relative grid items-center gap-10 lg:grid-cols-2 ${
                  flipped ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Nomor raksasa samar di latar — urutan memang bermakna */}
                <span
                  className={`pointer-events-none absolute -top-14 select-none text-[9rem] font-extrabold leading-none text-ink/5 ${
                    flipped ? "right-0" : "left-0"
                  }`}
                  aria-hidden="true"
                >
                  {number}
                </span>

                <div className="relative">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-extrabold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 max-w-sm text-2xl font-extrabold tracking-tight text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-sm text-moss">{body}</p>
                </div>

                <div
                  className={`flex justify-center ${
                    flipped ? "lg:-rotate-2" : "lg:rotate-2"
                  }`}
                >
                  <Card />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

export default HowItWorks;
