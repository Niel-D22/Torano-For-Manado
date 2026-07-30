import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

// Dialog konfirmasi bertema Torano (mis. konfirmasi keluar). Di-portal ke body
// agar tampil di atas navbar/dropdown, dengan animasi fade + scale.
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Ya, lanjut",
  cancelLabel = "Batal",
  danger = false,
  onConfirm,
  onCancel,
}) =>
  createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.95, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: "tween", duration: 0.18 }}
            className="relative w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-[0_30px_70px_-20px_rgba(13,59,46,0.5)]"
          >
            <h2 className="text-lg font-extrabold text-ink">{title}</h2>
            <p className="mt-1.5 text-sm text-moss">{message}</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="ring-focus flex-1 rounded-xl border border-line py-2.5 text-sm font-bold text-ink transition-colors hover:bg-cloud"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`ring-focus flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-colors ${
                  danger ? "bg-red-600 hover:bg-red-700" : "bg-forest hover:bg-ink"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

export default ConfirmDialog;
