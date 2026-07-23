import { useEffect } from "react";
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
import { categoryMap, MANADO_CENTER } from "../data/workers";
import { workerPhotos } from "../assets/workers/photos";
import { useAuthGate } from "../lib/auth";

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

function FlyTo({ worker }) {
  const map = useMap();
  useEffect(() => {
    if (worker) {
      map.flyTo([worker.lat, worker.lng], Math.max(map.getZoom(), 14), {
        duration: 0.7,
      });
    }
  }, [worker, map]);
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
      <FlyTo worker={selected} />

      {workers.map((w) => {
        const cat = categoryMap[w.category];
        return (
          <Marker
            key={w.id}
            position={[w.lat, w.lng]}
            icon={makeIcon(w, w.id === selectedId)}
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
                    <img
                      src={workerPhotos[w.id]}
                      alt={w.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-sm font-extrabold text-ink">
                      {w.name}
                      <BadgeCheck className="h-4 w-4 shrink-0 text-forest" aria-label="Terverifikasi" />
                    </p>
                    <p className="mt-0.5 truncate text-xs" style={{ color: cat.color }}>
                      {cat.label}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-moss">
                      <Star className="h-3.5 w-3.5 fill-sun text-sun" />
                      <span className="font-bold text-ink">{w.rating.toFixed(1)}</span>
                      ({w.jobs} jobs)
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-forest">
                      Rp{w.priceMin}–{w.priceMax}rb
                      <span className="text-xs font-semibold text-moss">/jam</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => gate(() => navigate(`/chat/${w.id}`))}
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
