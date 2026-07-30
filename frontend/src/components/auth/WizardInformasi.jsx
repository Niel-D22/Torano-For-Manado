import { useRef, useState } from "react";
import { ShieldCheck, User, Lock } from "lucide-react";
import { TextField, PhoneField, PasswordField } from "./fields";

// Langkah 2 — buat akun + verifikasi OTP.
const WizardInformasi = ({ form, set, onNext }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const boxes = useRef([]);

  const onOtp = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const nextOtp = [...otp];
    nextOtp[i] = v;
    setOtp(nextOtp);
    if (v && i < 5) boxes.current[i + 1]?.focus();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!otpSent) setOtpSent(true);
    else onNext();
  };

  return (
    <form onSubmit={submit}>
      <div className="mt-5 text-center">
        <h1 className="text-xl font-extrabold tracking-tight text-ink">
          Buat akun kamu
        </h1>
        <p className="mt-1 text-sm text-moss">
          Isi informasi berikut untuk membuat akun Torano
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <TextField
          id="nama"
          label="Nama Lengkap"
          icon={User}
          placeholder="Contoh: Andi Setiawan"
          value={form.nama}
          onChange={(e) => set({ nama: e.target.value })}
          autoComplete="name"
        />
        <PhoneField
          id="telepon"
          label="Nomor Telepon"
          note={
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-moss">
              <ShieldCheck className="h-4 w-4 text-forest" aria-hidden="true" />
              Kami akan kirim kode OTP ke nomor ini
            </p>
          }
        />
        <PasswordField
          id="sandi"
          label="Kata Sandi"
          withIcon
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        className="ring-focus mt-5 h-11 w-full rounded-xl bg-ink text-sm font-bold text-white transition-colors hover:bg-forest"
      >
        {otpSent ? "Verifikasi & Lanjut" : "Kirim Kode OTP"}
      </button>

      <div className="my-4 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="text-sm text-moss">atau</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="rounded-2xl bg-cloud/60 p-4 text-center">
        <p className="text-sm font-bold text-ink">Masukkan kode dari SMS</p>
        <div className="mt-3 flex justify-center gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (boxes.current[i] = el)}
              value={digit}
              onChange={(e) => onOtp(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit OTP ke-${i + 1}`}
              disabled={!otpSent}
              className="ring-focus h-12 w-11 rounded-xl border border-line bg-white text-center text-lg font-bold text-ink focus:outline-none disabled:opacity-50"
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-moss">
          Kirim ulang dalam <span className="font-bold text-sun">00:42</span>
        </p>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-sm text-moss">
        <Lock className="h-4 w-4" aria-hidden="true" />
        Data kamu aman bersama kami
      </p>
    </form>
  );
};

export default WizardInformasi;
