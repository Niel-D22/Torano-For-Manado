import { useState } from "react";
import { toast } from "sonner";
import { Trash2, ShieldAlert } from "lucide-react";
import { api } from "../lib/api";
import Modal from "./Modal";
import Spinner from "./Spinner";
import ImageUpload from "./ImageUpload";

const REASONS = [
  "Pekerjaan tidak selesai",
  "Hasil tidak sesuai kesepakatan",
  "Mitra tidak datang",
  "Pelanggan tidak kooperatif",
  "Kerusakan saat pengerjaan",
  "Lainnya",
];

const inputCls =
  "ring-focus w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none";

// Form laporan sengketa. Mengisi data yang sama dengan yang tampil di panel
// Sengketa admin: alasan, penjelasan, dan bukti foto.
const DisputeModal = ({ open, onClose, paymentId, onDone }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Pilih alasan sengketa");
      return;
    }
    setBusy(true);
    try {
      await api.post("/disputes", {
        paymentId,
        reason,
        description: description.trim() || undefined,
        evidence,
      });
      toast.success("Laporan sengketa terkirim. Admin akan meninjau.");
      onClose?.();
      onDone?.();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal mengirim laporan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="Laporkan Sengketa" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="flex items-start gap-2 rounded-xl bg-sun/10 px-3 py-2 text-xs text-[#8a6a00]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Dana tetap ditahan Torano selama sengketa berlangsung sampai admin memutuskan.
        </p>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Alasan</span>
          <select className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} required>
            <option value="" disabled>
              Pilih alasan
            </option>
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Penjelasan</span>
          <textarea
            className={`${inputCls} h-24`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ceritakan masalahnya sejelas mungkin agar admin mudah menilai."
          />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-bold text-ink">Bukti foto (opsional)</span>
          {evidence.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {evidence.map((url) => (
                <div key={url} className="group relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-xl border border-line object-cover" />
                  <button
                    type="button"
                    onClick={() => setEvidence((prev) => prev.filter((u) => u !== url))}
                    className="absolute right-1 top-1 hidden rounded-lg bg-white/90 p-1 text-red-600 group-hover:block"
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {evidence.length < 3 && (
            <ImageUpload
              folder="sengketa"
              facing="environment"
              hint="Maksimal 3 foto"
              onChange={(url) => setEvidence((prev) => [...prev, url])}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="ring-focus flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
        >
          {busy && <Spinner />}
          {busy ? "Mengirim…" : "Kirim Laporan Sengketa"}
        </button>
      </form>
    </Modal>
  );
};

export default DisputeModal;
