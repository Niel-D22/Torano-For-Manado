import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
};

// Modal bertema Torano: responsif penuh. Di ponsel tampil sebagai bottom sheet
// yang naik mulus dan bisa digulir; di layar lebar mengambang di tengah.
const Modal = ({ open, title, onClose, children, size = "md" }) => {
  // Kunci scroll body saat modal terbuka.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-10px_60px_-15px_rgba(13,59,46,0.4)] sm:max-h-[90vh] sm:rounded-2xl sm:border sm:border-line sm:shadow-[0_30px_70px_-20px_rgba(13,59,46,0.5)] ${SIZES[size] ?? SIZES.md}`}
          >
            {/* Pegangan bottom sheet (hanya ponsel) */}
            <div className="flex justify-center pt-2 sm:hidden">
              <span className="h-1.5 w-10 rounded-full bg-line" aria-hidden="true" />
            </div>

            <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5 sm:py-4">
              <h2 className="truncate pr-2 text-lg font-extrabold text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="ring-focus shrink-0 rounded-lg p-1.5 text-moss transition-colors hover:bg-cloud hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Modal;
