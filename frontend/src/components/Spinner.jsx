import { Loader2 } from "lucide-react";

// Spinner kecil untuk state loading pada tombol/aksi.
const Spinner = ({ className = "h-4 w-4" }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

export default Spinner;
