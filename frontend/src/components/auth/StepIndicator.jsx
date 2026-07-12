import { Check } from "lucide-react";

// Indikator langkah pendaftaran (Peran → Informasi → Verifikasi → Selesai).
// Dipakai ulang di seluruh alur daftar; `current` = nomor langkah aktif (1-4).
const steps = ["Peran", "Informasi", "Verifikasi", "Selesai"];

const StepIndicator = ({ current = 1 }) => (
  <ol className="flex items-center justify-center">
    {steps.map((label, i) => {
      const step = i + 1;
      const done = step < current;
      const active = step === current;
      return (
        <li key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <span
              className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition-colors ${
                done || active
                  ? "bg-ink text-white"
                  : "border border-line bg-white text-moss"
              }`}
            >
              {done ? <Check className="h-4 w-4" aria-hidden="true" /> : step}
            </span>
            <span
              className={`mt-2 text-xs font-semibold ${
                active ? "text-ink" : "text-moss"
              }`}
            >
              {label}
            </span>
          </div>
          {step < steps.length && (
            <span
              className={`mx-2 mb-5 h-px w-10 sm:w-16 ${
                done ? "bg-ink" : "border-t border-dashed border-line"
              }`}
              aria-hidden="true"
            />
          )}
        </li>
      );
    })}
  </ol>
);

export default StepIndicator;
