import { useState } from "react";
import { paymentMethods } from "../data/chats";
import { CloseIcon, CheckIcon } from "./icons";

// Mock pembayaran ala Midtrans Snap. Tanpa integrasi nyata (prototipe).
const MidtransSheet = ({ open, amount, onClose, onSuccess }) => {
  const [step, setStep] = useState("select");
  const [method, setMethod] = useState("gopay");

  if (!open) return null;

  const pay = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 1400);
  };

  const finish = () => {
    onSuccess(paymentMethods.find((m) => m.id === method)?.label || "Midtrans");
    setStep("select");
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={step === "processing" ? undefined : onClose}
      />
      <div className="animate-rise relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        {/* Header ala Midtrans */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#0b3d91] px-2 py-1 text-xs font-extrabold text-white">
              midtrans
            </span>
            <span className="text-sm font-semibold text-ink">Pembayaran</span>
          </div>
          {step !== "processing" && (
            <button onClick={onClose} className="text-moss hover:text-ink">
              <CloseIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm text-moss">Total pembayaran</span>
          <span className="text-2xl font-extrabold text-ink">
            Rp{amount}.000
          </span>
        </div>

        {step === "select" && (
          <>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-moss">
              Pilih metode pembayaran
            </p>
            <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    method === m.id
                      ? "border-forest bg-limesoft/50"
                      : "border-line hover:border-moss/40"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {m.label}
                    </span>
                    <span className="block text-xs text-moss">{m.hint}</span>
                  </span>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full border ${
                      method === m.id
                        ? "border-forest bg-forest text-white"
                        : "border-line"
                    }`}
                  >
                    {method === m.id && <CheckIcon className="h-3 w-3" />}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={pay}
              className="ring-focus mt-4 w-full rounded-xl bg-forest py-3.5 font-semibold text-white transition-colors hover:bg-ink"
            >
              Bayar Rp{amount}.000
            </button>
            <p className="mt-3 text-center text-[11px] text-moss">
              Transaksi diamankan &amp; diproses oleh Midtrans
            </p>
          </>
        )}

        {step === "processing" && (
          <div className="grid place-items-center py-12">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-cloud border-t-forest" />
            <p className="mt-4 text-sm font-medium text-moss">
              Memproses pembayaran…
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="grid place-items-center py-10 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-limesoft text-forest">
              <CheckIcon className="h-8 w-8" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-ink">
              Pembayaran berhasil
            </h3>
            <p className="mt-1 text-sm text-moss">
              Dana ditahan aman sampai pekerjaan selesai.
            </p>
            <button
              onClick={finish}
              className="ring-focus mt-5 w-full rounded-xl bg-forest py-3.5 font-semibold text-white hover:bg-ink"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MidtransSheet;
