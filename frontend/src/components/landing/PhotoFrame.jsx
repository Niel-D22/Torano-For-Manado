import { ImageIcon } from "lucide-react";

// Bingkai foto landing. Selama foto asli belum ada (src = null),
// tampil placeholder berlabel supaya layout final sudah terlihat.
const PhotoFrame = ({ src, alt, label, className = "" }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex flex-col items-center justify-center gap-2 bg-linear-to-br from-cloud to-line text-moss ${className}`}
    >
      <ImageIcon className="h-6 w-6 opacity-60" aria-hidden="true" />
      <span className="px-3 text-center text-xs font-semibold opacity-70">
        {label}
      </span>
    </div>
  );
};

export default PhotoFrame;
