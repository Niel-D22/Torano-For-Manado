import { Hammer } from "lucide-react";

// Placeholder halaman mitra yang akan dibuat pada langkah berikutnya.
const Soon = ({ title }) => (
  <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
    <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
    <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-line bg-white py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-limesoft text-forest">
        <Hammer className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-bold text-ink">Segera hadir</h2>
      <p className="mt-1 max-w-sm text-sm text-moss">
        Halaman {title} sedang disiapkan pada langkah pengembangan berikutnya.
      </p>
    </div>
  </div>
);

export default Soon;
