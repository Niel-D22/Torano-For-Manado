import { useState } from "react";
import AuthShell from "../components/auth/AuthShell";
import StepIndicator from "../components/auth/StepIndicator";
import WizardInformasi from "../components/auth/WizardInformasi";
import WizardKeahlian from "../components/auth/WizardKeahlian";
import WizardVerifikasi from "../components/auth/WizardVerifikasi";
import WizardSukses from "../components/auth/WizardSukses";

// Wizard pendaftaran pekerja. Langkah & data form disimpan lokal di sini;
// tiap langkah cukup komponen tampilan yang menerima form + navigasi.
// Label indikator mengikuti mockup: Informasi(2) → Verifikasi(3) → Selesai(4).
const DaftarPekerja = () => {
  const [step, setStep] = useState(2);
  const [form, setForm] = useState({
    nama: "",
    kategori: "art",
    tarifMin: "90",
    tarifMaks: "150",
    area: "Wanea, Manado",
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(2, s - 1));

  if (step === 5) {
    return (
      <AuthShell>
        <WizardSukses form={form} />
      </AuthShell>
    );
  }

  const tall = step === 3 || step === 4;
  const width = tall ? "max-w-5xl" : "max-w-xl";
  const Step =
    step === 2 ? WizardInformasi : step === 3 ? WizardKeahlian : WizardVerifikasi;

  return (
    <AuthShell>
      <div
        className={`relative w-full ${width} rounded-[28px] border border-line bg-white px-6 py-6 shadow-[0_30px_70px_rgba(13,59,46,0.12)] sm:px-10`}
      >
        <StepIndicator current={step} />
        <Step form={form} set={set} onNext={next} onBack={back} />
      </div>
    </AuthShell>
  );
};

export default DaftarPekerja;
