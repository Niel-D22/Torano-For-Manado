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
import { Link } from "react-router-dom";
import { categoryMap, MANADO_CENTER } from "../data/workers";
import { StarIcon, PinIcon, ArrowIcon } from "./icons";

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const makeIcon = (worker, active) => {
  const color = categoryMap[worker.category].color;
  const size = active ? 44 : 38;
  return L.divIcon({
    className: "torano-pin",
    html: `<div class="tp${active ? " tp-active" : ""}" style="--pin:${color}">
             <span class="tp-body">${initials(worker.name)}</span>
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
};

// Menggerakkan peta ke pekerja terpilih.
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

// Pastikan peta menghitung ulang ukuran setelah kontainer siap (hindari tile kosong).
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

const MapView = ({ workers, selectedId, onSelect }) => {
  const selected = workers.find((w) => w.id === selectedId) || null;

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
              <div className="w-56 font-sans">
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white"
                    style={{ background: cat.color }}
                  >
                    {initials(w.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">
                      {w.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-moss">
                      <StarIcon className="h-3.5 w-3.5 text-sun" />
                      {w.rating.toFixed(1)} · {cat.short}
                    </p>
                  </div>
                </div>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-moss">
                  <PinIcon className="h-3.5 w-3.5 text-leaf" />
                  {w.area} · {w.distanceKm.toFixed(1)} km dari kamu
                </p>

                <p className="mt-1.5 text-sm font-bold text-ink">
                  Rp{w.priceMin}–{w.priceMax}rb
                  <span className="text-xs font-medium text-moss"> /hari</span>
                </p>

                <Link
                  to={`/pekerja/${w.id}`}
                  className="tp-cta mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-forest py-2 text-sm font-semibold text-white hover:bg-ink"
                >
                  Lihat Profil
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;
