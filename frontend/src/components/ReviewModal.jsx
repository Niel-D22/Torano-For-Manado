import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { api } from "../lib/api";
import Modal from "./Modal";
import Spinner from "./Spinner";

// Ulasan pelanggan untuk pekerja setelah dana dilepas.
const ReviewModal = ({ open, onClose, paymentId, workerName, onDone }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Pilih rating bintang dulu");
      return;
    }
    setBusy(true);
    try {
      await api.post("/reviews", { paymentId, rating, comment: comment.trim() || undefined });
      toast.success("Terima kasih atas ulasanmu");
      onClose?.();
      onDone?.();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal mengirim ulasan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title={`Beri Ulasan${workerName ? ` untuk ${workerName}` : ""}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${i} bintang`}
                className="ring-focus rounded"
              >
                <Star
                  className={`h-9 w-9 transition-colors ${
                    i <= (hover || rating) ? "fill-sun text-sun" : "fill-line text-line"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold text-moss">
            {["", "Sangat kurang", "Kurang", "Cukup", "Bagus", "Sangat bagus"][hover || rating] || "Ketuk bintang"}
          </p>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Komentar (opsional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ceritakan pengalamanmu memakai jasa ini."
            className="ring-focus h-24 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="ring-focus flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
        >
          {busy && <Spinner />}
          {busy ? "Mengirim…" : "Kirim Ulasan"}
        </button>
      </form>
    </Modal>
  );
};

export default ReviewModal;
