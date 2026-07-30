import { useState } from "react";
import { Eye, EyeOff, Lock, ChevronDown } from "lucide-react";

// Field auth yang dipakai berulang di halaman login/daftar.
// Digabung dalam satu file agar ringkas (semua sekelas & saling terkait).

const base =
  "ring-focus h-11 w-full rounded-xl border border-line bg-paper text-sm text-ink placeholder:text-moss/60 focus:outline-none";

export const TextField = ({ id, label, icon: Icon, ...props }) => (
  <div>
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-moss"
          aria-hidden="true"
        />
      )}
      <input id={id} className={`${base} ${Icon ? "pl-11 pr-4" : "px-4"}`} {...props} />
    </div>
  </div>
);

export const PhoneField = ({ id, label, note, ...props }) => (
  <div>
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
      </label>
    )}
    <div className="flex gap-2">
      <span className="flex h-11 items-center gap-1 rounded-xl border border-line bg-paper px-3 text-sm font-bold text-ink">
        +62
        <ChevronDown className="h-4 w-4 text-moss" aria-hidden="true" />
      </span>
      <input
        id={id}
        type="tel"
        placeholder="Contoh: 812 3456 7890"
        className={base}
        {...props}
      />
    </div>
    {note}
  </div>
);

export const PasswordField = ({ id, label, withIcon = false, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {withIcon && (
          <Lock
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-moss"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`${base} pr-12 ${withIcon ? "pl-11" : "px-4"}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
          className="ring-focus absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-moss transition-colors hover:text-ink"
        >
          {show ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
};
