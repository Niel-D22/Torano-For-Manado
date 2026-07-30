import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MANADO_CENTER } from "../data/workers";

// Pin hijau (divIcon, tanpa aset gambar agar aman dengan bundler).
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#16a34a;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 6px 12px -4px rgba(13,59,46,.6)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function Resizer() {
  const map = useMap();
  useEffect(() => {
    const timers = [150, 450, 800].map((t) => setTimeout(() => map.invalidateSize(), t));
    return () => timers.forEach(clearTimeout);
  }, [map]);
  return null;
}

function Clicker({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// Peta pemilih titik lokasi + radius. interactive: klik peta / geser pin.
const LocationPicker = ({
  lat,
  lng,
  radiusKm = 5,
  interactive = true,
  onChange,
  className = "h-56 w-full",
}) => {
  const has = lat != null && lng != null;
  const center = has ? [lat, lng] : MANADO_CENTER;
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      dragging={interactive}
      className={`${className} rounded-xl border border-line`}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
        subdomains="abcd"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />
      <Resizer />
      {interactive && <Clicker onPick={onChange} />}
      {has && (
        <>
          <Marker
            position={[lat, lng]}
            icon={pinIcon}
            draggable={interactive}
            eventHandlers={
              interactive
                ? {
                    dragend: (e) => {
                      const p = e.target.getLatLng();
                      onChange(p.lat, p.lng);
                    },
                  }
                : {}
            }
          />
          <Circle
            center={[lat, lng]}
            radius={(radiusKm || 5) * 1000}
            pathOptions={{ color: "#16a34a", weight: 1.5, fillColor: "#16a34a", fillOpacity: 0.12 }}
          />
        </>
      )}
    </MapContainer>
  );
};

export default LocationPicker;
