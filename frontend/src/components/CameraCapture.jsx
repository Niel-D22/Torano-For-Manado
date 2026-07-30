import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Spinner from "./Spinner";

// Ambil foto langsung dari kamera perangkat (API bawaan getUserMedia, tanpa
// library tambahan). facing "user" = kamera depan (selfie), "environment" = belakang.
const CameraCapture = ({ open, facing = "user", onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Perangkat/browser tidak mendukung kamera");
      onClose();
      return;
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch {
        toast.error("Tidak bisa membuka kamera. Berikan izin kamera lalu coba lagi.");
        onClose();
      }
    })();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, facing, onClose]);

  const snap = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setBusy(true);
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setBusy(false);
          return;
        }
        const file = new File([blob], `kamera-${Date.now()}.jpg`, { type: "image/jpeg" });
        try {
          await onCapture(file);
        } finally {
          setBusy(false);
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] grid place-items-center bg-ink/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`aspect-[3/4] w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
            />
            {!ready && (
              <div className="absolute inset-0 grid place-items-center text-white">
                <Spinner className="h-8 w-8" />
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="ring-focus absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-center p-5">
              <button
                type="button"
                onClick={snap}
                disabled={!ready || busy}
                aria-label="Ambil foto"
                className="ring-focus grid h-16 w-16 place-items-center rounded-full bg-white ring-4 ring-white/40 transition-transform hover:scale-105 disabled:opacity-60"
              >
                {busy ? <Spinner className="h-6 w-6 text-ink" /> : <Camera className="h-7 w-7 text-ink" />}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CameraCapture;
