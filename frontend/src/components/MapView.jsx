import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { MessageSquareText, Star, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { categoryMap, MANADO_CENTER } from "../data/workers";
import { api } from "../lib/api";
import { useAuthGate } from "../lib/auth";
import Avatar from "./Avatar";

// Pin harga (mockup): pil "Rp90rb"; yang terpilih jadi hijau tua & lebih menonjol.
const makeIcon = (worker, active) => {
  const label = `Rp${worker.priceMin}rb`;
  return L.divIcon({
    className: "price-pin",
    html: `<div class="pp${active ? " pp-active" : ""}">${label}</div>`,
    iconSize: [70, 34],
    iconAnchor: [35, 33],
    popupAnchor: [0, -30],
  });
};

// Kamera peta: saat pertama terbuka, tampilkan SELURUH area (semua pin terlihat,
// seperti referensi) lalu buka popup pekerja terpilih. Saat memilih kartu lain,
// cukup geser lembut ke pekerja itu tanpa mengubah zoom agar pin lain tetap terlihat.
function SelectSync({ selected, workers, markerRefs }) {
  const map = useMap();
  const init = useRef(false);

  useEffect(() => {
    if (!selected) return;
    const openPopup = () => markerRefs.current[selected.id]?.openPopup();

    if (!init.current) {
      init.current = true;
      const bounds = L.latLngBounds(workers.map((w) => [w.lat, w.lng]));
      // Tunggu panel selesai menggeser & ukuran peta stabil sebelum fit.
      const t = setTimeout(() => {
        map.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
        setTimeout(openPopup, 350);
      }, 560);
      return () => clearTimeout(t);
    }

    map.panTo([selected.lat, selected.lng], { animate: true, duration: 0.5 });
    const t = setTimeout(openPopup, 250);
    return () => clearTimeout(t);
  }, [selected, workers, map, markerRefs]);

  return null;
}

// Panel peta menggeser masuk (animasi framer-motion), jadi ukuran kontainer
// berubah selama beberapa ratus ms. ResizeObserver memanggil invalidateSize
// setiap kali ukuran berubah → seluruh tile termuat, tanpa area abu-abu di tepi.
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    ro.observe(el);
    // Jaring pengaman untuk browser tanpa event resize awal.
    const timers = [200, 500, 900].map((t) =>
      setTimeout(() => map.invalidateSize({ animate: false }), t),
    );
    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [map]);
  return null;
}

const MapView = ({ workers, selectedId, onSelect }) => {
  const selected = workers.find((w) => w.id === selectedId) || null;
  const navigate = useNavigate();
  const gate = useAuthGate();
  const markerRefs = useRef({});

  const startChat = async (workerProfileId) => {
    try {
      await api.post("/chat/conversations", { workerProfileId });
      navigate("/chat");
    } catch {
      toast.error("Gagal memulai chat");
    }
  };

  return (
    <MapContainer
      center={MANADO_CENTER}
      zoom={13}
      zoomControl={false}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      {/* CARTO Voyager — gaya bersih menyerupai Google Maps (jalan kuning,
          taman hijau muda, air biru muda, label kawasan) */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />
      <AutoResize />
      <SelectSync selected={selected} workers={workers} markerRefs={markerRefs} />

      {workers.map((w) => {
        const cat = categoryMap[w.category];
        return (
          <Marker
            key={w.id}
            position={[w.lat, w.lng]}
            icon={makeIcon(w, w.id === selectedId)}
            ref={(el) => {
              if (el) markerRefs.current[w.id] = el;
            }}
            eventHandlers={{ click: () => onSelect(w.id) }}
          >
            <Popup>
              <div className="w-64 font-sans">
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/pekerja/${w.id}`)}
                    className="shrink-0"
                    aria-label={`Lihat profil ${w.name}`}
                  >
                    <Avatar
                      src={w.photo}
                      name={w.name}
                      className="h-16 w-16"
                      square
                      textClass="text-lg"
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-sm font-extrabold text-ink">
                      {w.name}
                      <BadgeCheck className="h-4 w-4 shrink-0 fill-[#2f80ed] text-white" aria-label="Terverifikasi" />
                    </p>
                    <p className="mt-0.5 truncate text-xs" style={{ color: cat.color }}>
                      {cat.label}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-moss">
                      <Star className="h-3.5 w-3.5 fill-sun text-sun" />
                      <span className="font-bold text-ink">{(w.rating ?? 0).toFixed(1)}</span>
                      ({w.jobs} jobs)
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-forest">
                      Rp{w.priceMin}–{w.priceMax}rb
                      <span className="text-xs font-semibold text-moss">/jam</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => gate(() => startChat(w.profileId))}
                  className="tp-cta mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-forest py-2.5 text-sm font-bold text-white hover:bg-ink"
                >
                  <MessageSquareText className="h-4 w-4" />
                  Chat
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;
