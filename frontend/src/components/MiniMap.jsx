import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Peta kecil non-interaktif untuk menampilkan satu titik lokasi (share location).
const pinIcon = L.divIcon({
  className: "torano-pin",
  html: `<div class="tp" style="--pin:#16a34a"><span class="tp-body">●</span></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

const MiniMap = ({ lat, lng, zoom = 15 }) => (
  <MapContainer
    center={[lat, lng]}
    zoom={zoom}
    dragging={false}
    scrollWheelZoom={false}
    doubleClickZoom={false}
    zoomControl={false}
    attributionControl={false}
    keyboard={false}
    className="h-full w-full"
  >
    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />
    <Marker position={[lat, lng]} icon={pinIcon} />
  </MapContainer>
);

export default MiniMap;
