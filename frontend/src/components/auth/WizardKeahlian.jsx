import { Check, ArrowRight, Camera, Plus, Lock, Sparkles, Hammer, Users, Wrench, MapPin, X } from "lucide-react";
import { categories } from "../../data/workers";

// Langkah 3 — keahlian, tarif, area, foto (mockup: "Ceritakan keahlianmu").
const icons = { art: Sparkles, tukang: Hammer, event: Users, montir: Wrench };
const portfolio = ["Sebelum", "Sesudah", "Memasak"];

const WizardKeahlian = ({ form, set, onNext }) => (
  <div>
    <div className="mt-5 text-center">
      <h1 className="text-xl font-extrabold tracking-tight text-ink">
        Ceritakan keahlianmu
      </h1>
      <p className="mt-1 text-sm text-moss">
        Informasi ini membantu pelanggan menemukanmu dengan tepat.
      </p>
    </div>

    <div className="mt-5 grid gap-8 lg:grid-cols-2">
      {/* Kolom kiri */}
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-bold text-ink">Pilih kategori pekerjaan</p>
          <div className="grid grid-cols-4 gap-2.5">
            {categories.map((c) => {
              const Icon = icons[c.id];
              const active = form.kategori === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set({ kategori: c.id })}
                  className={`ring-focus relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-colors ${
                    active ? "border-forest bg-limesoft/40" : "border-line hover:border-leaf/60"
                  }`}
                >
                  {active && (
                    <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-forest text-white">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                  )}
                  <Icon
                    className="h-6 w-6"
                    style={{ color: c.color }}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-semibold leading-tight text-ink">
                    {c.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="deskripsi" className="mb-1.5 block text-sm font-bold text-ink">
            Deskripsi keahlian
          </label>
          <textarea
            id="deskripsi"
            rows={2}
            maxLength={300}
            defaultValue="Saya berpengalaman lebih dari 5 tahun dalam pekerjaan rumah tangga seperti membersihkan rumah, mencuci, menyetrika, dan memasak."
            className="ring-focus w-full rounded-2xl border border-line bg-paper p-3 text-sm text-ink focus:outline-none"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-bold text-ink">Tarif per jam (kisaran)</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-2xl border border-line bg-paper px-3 py-2">
              <span className="block text-[11px] text-moss">Dari</span>
              <div className="flex items-center gap-1 font-bold text-ink">
                Rp
                <input
                  value={form.tarifMin}
                  onChange={(e) => set({ tarifMin: e.target.value })}
                  className="w-full bg-transparent focus:outline-none"
                  aria-label="Tarif minimum"
                />
                rb
              </div>
            </div>
            <span className="text-moss" aria-hidden="true">—</span>
            <div className="flex-1 rounded-2xl border border-line bg-paper px-3 py-2">
              <span className="block text-[11px] text-moss">Sampai</span>
              <div className="flex items-center gap-1 font-bold text-ink">
                Rp
                <input
                  value={form.tarifMaks}
                  onChange={(e) => set({ tarifMaks: e.target.value })}
                  className="w-full bg-transparent focus:outline-none"
                  aria-label="Tarif maksimum"
                />
                rb
              </div>
            </div>
            <span className="text-sm text-moss">/ jam</span>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-bold text-ink">Area kerja</p>
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="flex items-center justify-between bg-paper px-3 py-2 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <MapPin className="h-4 w-4 text-forest" aria-hidden="true" />
                {form.area}
              </span>
              <span className="text-xs text-moss">Radius: 5 km</span>
            </div>
            {/* ponytail: placeholder peta statis; peta live berlebihan untuk form daftar */}
            <div className="relative grid h-20 place-items-center bg-cloud/70">
              <span className="h-20 w-20 rounded-full border-2 border-dashed border-forest/50 bg-forest/10" />
              <MapPin className="absolute h-6 w-6 text-forest" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Kolom kanan */}
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-bold text-ink">Foto profil</p>
          <div className="grid h-28 place-items-center rounded-2xl border-2 border-dashed border-line bg-paper text-center">
            <div>
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-cloud text-moss">
                <Camera className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-2 text-sm font-bold text-forest">Upload foto profil</p>
              <p className="text-xs text-moss">Foto wajah yang jelas (disarankan persegi)</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-ink">
            Portofolio pekerjaan{" "}
            <span className="font-normal text-moss">(Opsional)</span>
          </p>
          <p className="mb-2 text-xs text-moss">Tambah foto hasil pekerjaanmu</p>
          <div className="flex gap-2.5">
            <button
              type="button"
              className="ring-focus grid h-20 w-20 shrink-0 place-items-center rounded-xl border-2 border-dashed border-line text-moss hover:border-leaf/60"
            >
              <span className="text-center text-xs">
                <Plus className="mx-auto h-5 w-5" aria-hidden="true" />
                Tambah foto
              </span>
            </button>
            {portfolio.map((label) => (
              <div
                key={label}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cloud"
              >
                <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-white/90 text-moss">
                  <X className="h-3 w-3" aria-hidden="true" />
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-ink/50 py-0.5 text-center text-[10px] text-white">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-moss">Maks. 6 foto. JPG/PNG, maks. 5MB per foto.</p>
        </div>
      </div>
    </div>

    <button
      type="button"
      onClick={onNext}
      className="ring-focus mx-auto mt-6 flex h-12 w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-ink font-bold text-white transition-colors hover:bg-forest"
    >
      Lanjut
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </button>
    <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-moss">
      <Lock className="h-4 w-4" aria-hidden="true" />
      Informasi kamu aman bersama kami
    </p>
  </div>
);

export default WizardKeahlian;
