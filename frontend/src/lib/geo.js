// Batas wilayah Manado raya. Semua aktivitas dibatasi di area ini.
export const MANADO_BOUNDS = {
  south: 1.38,
  west: 124.72,
  north: 1.58,
  east: 124.96,
};
export const MANADO_CENTER = { lat: 1.4748, lng: 124.8421 };

// Bentuk bounds untuk Leaflet: [[south, west], [north, east]].
export const MANADO_LEAFLET_BOUNDS = [
  [MANADO_BOUNDS.south, MANADO_BOUNDS.west],
  [MANADO_BOUNDS.north, MANADO_BOUNDS.east],
];

export const inManado = (lat, lng) =>
  lat >= MANADO_BOUNDS.south &&
  lat <= MANADO_BOUNDS.north &&
  lng >= MANADO_BOUNDS.west &&
  lng <= MANADO_BOUNDS.east;

// Jarak haversine (km).
export const distanceKm = (aLat, aLng, bLat, bLng) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const NOMINATIM = "https://nominatim.openstreetmap.org";
const { west, north, east, south } = MANADO_BOUNDS;
const VIEWBOX = `${west},${north},${east},${south}`;

// Cari alamat/tempat, dibatasi kotak Manado.
export async function searchPlaces(q) {
  if (!q || q.trim().length < 3) return [];
  const url =
    `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(q)}` +
    `&viewbox=${VIEWBOX}&bounded=1&limit=6&addressdetails=1&countrycodes=id`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    return data
      .map((d) => ({
        label: d.display_name,
        name: d.name || d.display_name.split(",")[0],
        lat: Number(d.lat),
        lng: Number(d.lon),
      }))
      .filter((d) => inManado(d.lat, d.lng));
  } catch {
    return [];
  }
}

// Alamat ringkas dari koordinat.
export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const d = await res.json();
    const a = d.address || {};
    const parts = [
      a.road || a.neighbourhood || a.suburb,
      a.suburb || a.village || a.city_district,
      a.city || a.town || a.county,
    ].filter(Boolean);
    return [...new Set(parts)].slice(0, 3).join(", ") || d.display_name || null;
  } catch {
    return null;
  }
}
