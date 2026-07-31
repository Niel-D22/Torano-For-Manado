import { useEffect, useRef, useState } from "react";
import { MapPin, Check, AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import MapPointPicker from "./MapPointPicker";
import { MANADO_CENTER, inManado, reverseGeocode } from "../lib/geo";

// Pencari menandai titik lokasinya dengan pengalaman seperti aplikasi peta:
// cari alamat, pin di tengah, alamat otomatis, dibatasi area Manado.
const LokasiPickerModal = ({ open, onClose, initial, onPick }) => {
  const [coords, setCoords] = useState(initial ?? MANADO_CENTER);
  const [address, setAddress] = useState("");
  const [loadingAddr, setLoadingAddr] = useState(false);
  const debounce = useRef(null);

  // Alamat otomatis dari titik (reverse geocode, ditunda agar hemat).
  useEffect(() => {
    if (!open) return;
    clearTimeout(debounce.current);
    setLoadingAddr(true);
    debounce.current = setTimeout(async () => {
      const a = await reverseGeocode(coords.lat, coords.lng);
      setAddress(a || "Titik dipilih");
      setLoadingAddr(false);
    }, 500);
    return () => clearTimeout(debounce.current);
  }, [coords, open]);

  const ok = inManado(coords.lat, coords.lng);

  return (
    <Modal open={open} title="Tandai Lokasimu" onClose={onClose} size="lg">
      <div className="space-y-3">
        <MapPointPicker
          value={coords}
          onChange={(lat, lng) => setCoords({ lat, lng })}
          className="h-[55vh] min-h-[300px] sm:h-96"
        />

        {/* Alamat terpilih */}
        <div className="flex items-start gap-2 rounded-xl border border-line bg-paper p-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-moss">Lokasi terpilih</p>
            <p className="truncate text-sm font-bold text-ink">
              {loadingAddr ? "Membaca alamat…" : address}
            </p>
            <p className="text-xs text-moss">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          </div>
        </div>

        {!ok && (
          <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Untuk saat ini Torano hanya melayani area Manado.
          </p>
        )}

        <button
          type="button"
          disabled={!ok}
          onClick={() => {
            onPick({ lat: coords.lat, lng: coords.lng, label: address });
            onClose?.();
          }}
          className="ring-focus flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Pakai titik ini
        </button>
      </div>
    </Modal>
  );
};

export default LokasiPickerModal;
