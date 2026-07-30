import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Briefcase, MapPin, Clock, StickyNote, Send } from "lucide-react";
import { api } from "../lib/api";
import Modal from "./Modal";
import Spinner from "./Spinner";

const inputCls =
  "ring-focus h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink focus:outline-none";

const Field = ({ label, icon: Icon, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink">
      {Icon && <Icon className="h-4 w-4 text-forest" aria-hidden="true" />}
      {label}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-moss">{hint}</span>}
  </label>
);

// Gerbang permintaan (Model C): pencari mengirim permintaan singkat ke pekerja.
// Ini membuka percakapan dan memberi tahu pekerja sebelum tawar menawar di chat.
const RequestModal = ({ open, onClose, worker, chatPath = "/chat" }) => {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [area, setArea] = useState(worker?.area || "");
  const [preferredAt, setPreferredAt] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (jobTitle.trim().length < 3) {
      toast.error("Jelaskan dulu pekerjaan yang kamu butuhkan");
      return;
    }
    setBusy(true);
    try {
      await api.post("/requests", {
        workerProfileId: worker.profileId,
        jobTitle: jobTitle.trim(),
        area: area.trim() || undefined,
        preferredAt: preferredAt ? new Date(preferredAt).toISOString() : undefined,
        note: note.trim() || undefined,
      });
      toast.success("Permintaan terkirim. Lanjutkan di chat.");
      onClose?.();
      navigate(chatPath);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal mengirim permintaan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title={`Ajukan Permintaan ke ${worker?.name ?? "Pekerja"}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="rounded-xl bg-limesoft/50 px-3 py-2 text-xs text-forest">
          Kirim permintaan singkat dulu. Pekerja akan diberi tahu, lalu kalian bisa
          tawar harga dan atur jadwal di chat.
        </p>
        <Field label="Pekerjaan yang dibutuhkan" icon={Briefcase}>
          <input
            className={inputCls}
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={
              worker?.categoryName
                ? `mis. ${worker.categoryName} untuk perbaikan di rumah`
                : "mis. Perbaikan atap bocor"
            }
            required
          />
        </Field>
        <Field label="Area / lokasi" icon={MapPin}>
          <input
            className={inputCls}
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="mis. Wanea, Manado"
          />
        </Field>
        <Field
          label="Waktu diinginkan"
          icon={Clock}
          hint="Boleh dikosongkan bila masih fleksibel."
        >
          <input
            type="datetime-local"
            className={inputCls}
            value={preferredAt}
            onChange={(e) => setPreferredAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </Field>
        <Field label="Catatan (opsional)" icon={StickyNote}>
          <textarea
            className={`${inputCls} h-20 py-2`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ceritakan detail singkat pekerjaannya."
          />
        </Field>
        <button
          type="submit"
          disabled={busy}
          className="ring-focus flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
        >
          {busy ? <Spinner /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {busy ? "Mengirim..." : "Kirim Permintaan"}
        </button>
      </form>
    </Modal>
  );
};

export default RequestModal;
