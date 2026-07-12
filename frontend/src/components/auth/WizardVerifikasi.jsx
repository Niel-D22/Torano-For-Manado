import { useState } from "react";
import { ShieldCheck, Sun, Glasses, ScanFace, Lock, Check, RotateCcw, Camera, ArrowRight } from "lucide-react";
import { PhoneField } from "./fields";

// Langkah 4 — verifikasi wajah (foto langsung) + referensi komunitas.
const tips = [
  { icon: Sun, title: "Cari tempat terang", desc: "Cahaya yang cukup membantu hasil lebih jelas." },
  { icon: Glasses, title: "Lepas topi & kacamata", desc: "Pastikan wajahmu terlihat jelas tanpa halangan." },
  { icon: ScanFace, title: "Wajah di dalam bingkai", desc: "Posisikan wajahmu pas di dalam bingkai oval." },
];

const relations = [
  { id: "rt", label: "Ketua RT" },
  { id: "gereja", label: "Jemaat gereja" },
  { id: "mesjid", label: "Pengurus mesjid" },
  { id: "lainnya", label: "Lainnya" },
];

const WizardVerifikasi = ({ onNext }) => {
  const [captured, setCaptured] = useState(false);
  const [relation, setRelation] = useState("rt");

  return (
    <div>
      <div className="mt-5 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-forest text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-ink">
          Bangun kepercayaanmu
        </h1>
        <p className="mx-auto mt-1 max-w-xl text-sm text-moss">
          Verifikasi identitas dan dukungan dari warga akan membuat pelanggan
          merasa lebih aman menggunakan jasamu.
        </p>
      </div>

      {/* Dua bagian bersebelahan agar tinggi kartu tetap muat layar */}
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {/* 1. Verifikasi wajah */}
        <section className="rounded-3xl border border-line p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-forest text-xs font-bold text-white">1</span>
            <div>
              <h2 className="text-sm font-bold text-ink">Verifikasi Wajah</h2>
              <p className="text-xs text-moss">Ambil foto wajahmu secara langsung</p>
            </div>
          </div>

          <div className="relative mt-3 grid h-36 place-items-center overflow-hidden rounded-2xl bg-ink/90">
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 text-[11px] text-white">
              <span className="h-2 w-2 rounded-full bg-leaf" /> Online
            </span>
            <span className="h-32 w-24 rounded-[50%] border-2 border-white/80" />
          </div>
          <button
            type="button"
            onClick={() => setCaptured(true)}
            className="ring-focus mx-auto mt-2.5 flex items-center gap-2 text-sm font-bold text-ink"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border-[3px] border-forest">
              <Camera className="h-4 w-4 text-forest" aria-hidden="true" />
            </span>
            Ambil Foto
          </button>
          {captured && (
            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-cloud/60 p-2 text-sm">
              <span className="flex items-center gap-2 font-semibold text-ink">
                <Check className="h-4 w-4 text-forest" aria-hidden="true" /> Foto diterima
              </span>
              <button
                type="button"
                onClick={() => setCaptured(false)}
                className="ring-focus flex items-center gap-1 text-moss hover:text-ink"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Ulangi
              </button>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {tips.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cloud text-forest">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{title}</p>
                  <p className="text-xs leading-snug text-moss">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Dukungan komunitas */}
        <section className="rounded-3xl border border-line p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-forest text-xs font-bold text-white">2</span>
            <div>
              <h2 className="text-sm font-bold text-ink">Dukungan dari Komunitas</h2>
              <p className="text-xs text-moss">
                Referensi warga sekitar meningkatkan kepercayaan pelanggan.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm font-bold text-ink">Siapa yang mengenalmu di lingkunganmu?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {relations.map((r) => {
              const active = relation === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRelation(r.id)}
                  className={`ring-focus flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    active ? "border-forest bg-limesoft/50 text-ink" : "border-line text-moss hover:border-leaf/60"
                  }`}
                >
                  {active && <Check className="h-4 w-4 text-forest" aria-hidden="true" />}
                  {r.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="ref-nama" className="mb-1.5 block text-sm font-bold text-ink">
                Nama Lengkap Referensi
              </label>
              <input
                id="ref-nama"
                placeholder="Contoh: Bpk. John Lumemut"
                className="ring-focus h-12 w-full rounded-[14px] border border-line bg-paper px-4 text-sm text-ink placeholder:text-moss/60 focus:outline-none"
              />
            </div>
            <PhoneField id="ref-telepon" label="Nomor Telepon Referensi" />
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-xs text-moss">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
            Kami mungkin akan menghubungi referensimu untuk konfirmasi. Data & foto
            wajahmu aman, tidak dibagikan ke siapa pun.
          </p>
        </section>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="ring-focus mx-auto mt-5 flex h-12 w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-ink font-bold text-white transition-colors hover:bg-forest"
      >
        Kirim & Selesai
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-moss">
        <Lock className="h-4 w-4" aria-hidden="true" />
        Informasi kamu aman bersama kami
      </p>
    </div>
  );
};

export default WizardVerifikasi;
