import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Modal form bertema Torano (portal + animasi). Dipakai untuk edit profil mitra.
const Modal = ({ open, title, onClose, children }) =>
  createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-start justify-center overflow-y-auto p-4 sm:place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: "tween", duration: 0.18 }}
            className="relative my-8 w-full max-w-md rounded-2xl border border-line bg-white shadow-[0_30px_70px_-20px_rgba(13,59,46,0.5)]"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-extrabold text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="ring-focus rounded-lg p-1.5 text-moss transition-colors hover:bg-cloud hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

export default Modal;
