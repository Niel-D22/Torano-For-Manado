import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, LocateFixed, X } from "lucide-react";
import Spinner from "./Spinner";
import { MANADO_CENTER, MANADO_LEAFLET_BOUNDS, searchPlaces } from "../lib/geo";

// Lapor pusat peta setiap gerakan berhenti (pola pin di tengah, seperti Gojek/Maps).
function MoveWatcher({ onMove }) {
  const map = useMapEvents({
    moveend() {
      const c = map.getCenter();
      onMove(c.lat, c.lng);
    },
  });
  return null;
}

// Terbangkan peta ke target (hasil pencarian atau GPS).
function Flyer({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [target, map]);
  return null;
}

// Ukur ulang peta setelah modal selesai beranimasi (agar tile termuat penuh).
function Resizer() {
  const map = useMap();
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    ro.observe(map.getContainer());
    const timers = [150, 400, 800].map((t) =>
      setTimeout(() => map.invalidateSize({ animate: false }), t),
    );
    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [map]);
  return null;
}

const MapPointPicker = ({ value, onChange, className = "h-72" }) => {
  const [flyTarget, setFlyTarget] = useState(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounce = useRef(null);

  const onSearch = (val) => {
    setQ(val);
    clearTimeout(debounce.current);
    if (val.trim().length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    debounce.current = setTimeout(async () => {
      setResults(await searchPlaces(val));
      setSearching(false);
    }, 450);
  };

  const pick = (r) => {
    setResults([]);
    setQ(r.name);
    setFlyTarget({ lat: r.lat, lng: r.lng });
    onChange(r.lat, r.lng);
  };

  const useGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const t = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setFlyTarget(t);
        onChange(t.lat, t.lng);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const start = [value?.lat ?? MANADO_CENTER.lat, value?.lng ?? MANADO_CENTER.lng];

  return (
    <div className={`relative overflow-hidden rounded-xl border border-line ${className}`}>
      {/* Kotak pencarian */}
      <div className="absolute inset-x-2 top-2 z-[1000]">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 shadow-[0_10px_30px_-15px_rgba(13,59,46,0.5)]">
          <Search className="h-4 w-4 shrink-0 text-moss" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari tempat atau alamat di Manado..."
            className="h-10 w-full bg-transparent text-sm focus:outline-none"
          />
          {searching ? (
            <Spinner className="h-4 w-4 text-forest" />
          ) : q ? (
            <button type="button" onClick={() => { setQ(""); setResults([]); }} aria-label="Bersihkan">
              <X className="h-4 w-4 text-moss" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={useGps}
            aria-label="Gunakan lokasi saya"
            title="Gunakan lokasi saya"
            className="rounded-lg p-1 text-forest hover:bg-limesoft/50"
          >
            <LocateFixed className="h-4 w-4" />
          </button>
        </div>
        {results.length > 0 && (
          <ul className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-[0_20px_50px_-20px_rgba(13,59,46,0.4)]">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-cloud"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">{r.name}</span>
                    <span className="block truncate text-xs text-moss">{r.label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <MapContainer
        center={start}
        zoom={15}
        minZoom={12}
        maxBounds={MANADO_LEAFLET_BOUNDS}
        maxBoundsViscosity={1}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
          subdomains="abcd"
          maxZoom={20}
        />
        <ZoomControl position="bottomright" />
        <Resizer />
        <MoveWatcher onMove={onChange} />
        <Flyer target={flyTarget} />
      </MapContainer>

      {/* Pin tetap di tengah (ujung menunjuk pusat peta) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[900] -translate-x-1/2 -translate-y-full">
        <MapPin className="h-10 w-10 fill-forest text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[900] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest/40" />
    </div>
  );
};

export default MapPointPicker;
