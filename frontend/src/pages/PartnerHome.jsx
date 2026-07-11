import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categoryMap } from "../data/workers";
import {
  StarIcon,
  PinIcon,
  WalletIcon,
  ChatIcon,
  CheckIcon,
  ClockIcon,
  BellIcon,
} from "../components/icons";

const partner = { name: "Ventje Tumbelaka", category: "tukang", rating: 4.9 };

const initialRequests = [
  {
    id: 1,
    customer: "Ibu Christine",
    job: "Perbaikan tembok dapur retak",
    area: "Wanea",
    distanceKm: 1.2,
    price: 135,
    when: "Sabtu, 09:00",
    status: "new",
  },
  {
    id: 2,
    customer: "Pak Deni",
    job: "Cat ulang pagar depan",
    area: "Sario",
    distanceKm: 2.4,
    price: 110,
    when: "Minggu, 08:00",
    status: "new",
  },
  {
    id: 3,
    customer: "Kel. Lumintang",
    job: "Pasang rak dinding",
    area: "Bahu",
    distanceKm: 1.8,
    price: 90,
    when: "Fleksibel",
    status: "new",
  },
];

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const PartnerHome = () => {
  const [available, setAvailable] = useState(true);
  const [requests, setRequests] = useState(initialRequests);
  const [sos, setSos] = useState({ visible: true, seconds: 288 });

  useEffect(() => {
    if (!sos.visible) return;
    const t = setInterval(
      () =>
        setSos((s) =>
          s.seconds <= 1
            ? { visible: false, seconds: 0 }
            : { ...s, seconds: s.seconds - 1 },
        ),
      1000,
    );
    return () => clearInterval(t);
  }, [sos.visible]);

  const setStatus = (id, status) =>
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );

  const cat = categoryMap[partner.category];

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
      {/* Sapaan + toggle ketersediaan */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl font-bold text-white"
            style={{ background: cat.color }}
          >
            VT
          </div>
          <div>
            <p className="text-sm text-moss">Halo,</p>
            <h1 className="text-lg font-extrabold text-ink">
              {partner.name.split(" ")[0]} 👋
            </h1>
          </div>
        </div>
        <button
          onClick={() => setAvailable((v) => !v)}
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
            available
              ? "bg-forest text-white"
              : "border border-line bg-white text-moss"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              available ? "bg-lime" : "bg-moss"
            }`}
          />
          {available ? "Tersedia" : "Tidak tersedia"}
        </button>
      </div>

      {/* Pendapatan */}
      <div className="bg-brand mt-5 overflow-hidden rounded-3xl p-6 text-white">
        <p className="text-sm text-white/80">Pendapatan minggu ini</p>
        <p className="mt-1 text-3xl font-extrabold">Rp850.000</p>
        <div className="mt-4 flex gap-6 text-sm">
          <span className="flex items-center gap-1.5">
            <WalletIcon className="h-4 w-4" /> 6 kerja selesai
          </span>
          <span className="flex items-center gap-1.5">
            <StarIcon className="h-4 w-4 text-sun" /> {partner.rating} rating
          </span>
        </div>
      </div>

      {/* SOS Kerja Mendadak */}
      {sos.visible && (
        <div className="mt-5 overflow-hidden rounded-2xl border-2 border-red-400 bg-red-50">
          <div className="flex items-center justify-between bg-red-500 px-4 py-2 text-white">
            <span className="flex items-center gap-2 text-sm font-bold">
              <BellIcon className="h-4 w-4" /> SOS · Kerja Mendadak
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
              <ClockIcon className="h-3.5 w-3.5" /> {fmt(sos.seconds)}
            </span>
          </div>
          <div className="p-4">
            <p className="font-bold text-ink">
              Bantu masak acara keluarga — 3 jam
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-moss">
              <PinIcon className="h-4 w-4 text-red-500" /> Tikala · 3.1 km ·
              butuh sekarang
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-lg font-extrabold text-ink">
                Rp180.000
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSos({ visible: false, seconds: 0 })}
                  className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-moss"
                >
                  Lewati
                </button>
                <button
                  onClick={() => setSos({ visible: false, seconds: 0 })}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Ambil sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permintaan masuk */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-extrabold text-ink">Permintaan masuk</h2>
        <span className="rounded-full bg-cloud px-2.5 py-1 text-xs font-bold text-moss">
          {requests.filter((r) => r.status === "new").length} baru
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {requests.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-line bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-ink">{r.job}</p>
                <p className="mt-0.5 text-sm text-moss">{r.customer}</p>
              </div>
              <span className="shrink-0 font-extrabold text-ink">
                Rp{r.price}.000
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-moss">
              <span className="flex items-center gap-1.5">
                <PinIcon className="h-4 w-4 text-leaf" />
                {r.area} · {r.distanceKm} km
              </span>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4" />
                {r.when}
              </span>
            </div>

            {r.status === "new" ? (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setStatus(r.id, "declined")}
                  className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-moss hover:border-moss/50"
                >
                  Tolak
                </button>
                <button
                  onClick={() => setStatus(r.id, "accepted")}
                  className="flex-1 rounded-xl bg-forest py-2.5 text-sm font-semibold text-white hover:bg-ink"
                >
                  Terima
                </button>
              </div>
            ) : r.status === "accepted" ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-limesoft/60 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-forest">
                  <CheckIcon className="h-4 w-4" /> Diterima
                </span>
                <Link
                  to={`/chat/1`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-ink"
                >
                  <ChatIcon className="h-4 w-4" /> Chat pelanggan
                </Link>
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-cloud px-3 py-2.5 text-sm font-medium text-moss">
                Permintaan ditolak
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnerHome;
