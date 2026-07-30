// Avatar dengan fallback inisial (lingkaran warna) bila belum ada foto.
// Tidak memakai foto dummy orang, jadi akun baru tampil netral sampai isi foto.
const COLORS = ["#16a34a", "#0d3b2e", "#ca8a04", "#2f80ed", "#8a3ffc", "#0ea5e9"];

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase() || "?";

const colorFor = (name = "") =>
  COLORS[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORS.length];

const Avatar = ({ src, name = "", className = "h-10 w-10", square = false, textClass = "text-sm" }) => {
  const round = square ? "rounded-xl" : "rounded-full";
  if (src) {
    return <img src={src} alt="" className={`${className} ${round} object-cover`} />;
  }
  return (
    <span
      className={`${className} ${round} grid shrink-0 place-items-center font-bold text-white ${textClass}`}
      style={{ background: colorFor(name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
};

export default Avatar;
