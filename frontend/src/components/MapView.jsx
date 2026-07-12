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
import { MessageSquareText, Star, MapPin, ArrowRight } from "lucide-react";
import { categoryMap, MANADO_CENTER } from "../data/workers";
import { workerPhotos } from "../assets/workers/photos";
import { useAuthGate } from "../lib/auth";

// Pin harga (mockup): pil "Rp90rb"; yang terpilih jadi hijau tua & lebih menonjol.
const makeIcon = (worker, active) => {
  const label = `Rp${worker.priceMin}rb`;
  return L.divIcon({
    className: "price-pin",
    html: `<div class="pp${active ? " pp-active" : ""}">${label}</div>`,
    iconSize: [66, 28],
    iconAnchor: [33, 28],
    popupAnchor: [0, -26],
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

// Recalculate ukuran setelah panel slide selesai agar tile tidak kosong.
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 480);
    return () => clearTimeout(t);
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
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri — Esri, HERE, Garmin, © OpenStreetMap contributors"
        maxZoom={19}
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
              <div className="w-60 font-sans">
                <div className="flex items-center gap-3">
                  <img
                    src={workerPhotos[w.id]}
                    alt={w.name}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-ink">{w.name}</p>
                    <p className="truncate text-xs" style={{ color: cat.color }}>
                      {cat.label}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-moss">
                      <Star className="h-3.5 w-3.5 fill-sun text-sun" />
                      {w.rating.toFixed(1)} ({w.jobs} jobs)
                    </p>
                  </div>
                </div>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-moss">
                  <MapPin className="h-3.5 w-3.5 text-forest" />
                  {w.area} · {w.distanceKm.toFixed(1)} km
                </p>
                <p className="mt-1 font-extrabold text-forest">
                  Rp{w.priceMin}–{w.priceMax}rb
                  <span className="text-xs font-semibold text-moss"> / jam</span>
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => gate(() => navigate(`/chat/${w.id}`))}
                    className="tp-cta flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest py-2 text-sm font-bold text-white hover:bg-ink"
                  >
                    <MessageSquareText className="h-4 w-4" />
                    Chat
                  </button>
                  <button
                    onClick={() => navigate(`/pekerja/${w.id}`)}
                    className="grid place-items-center rounded-lg border border-line px-2.5 text-forest hover:border-forest"
                    aria-label="Lihat profil"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;
