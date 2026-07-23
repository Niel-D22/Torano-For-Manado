import { useNavigate } from "react-router-dom";
import { ShieldCheck, Sparkles, User, Briefcase, Wallet, MapPin, ArrowRight } from "lucide-react";
import { categoryMap } from "../../data/workers";

// Layar sukses — pendaftaran pekerja terkirim, menunggu verifikasi admin.
const WizardSukses = ({ form }) => {
  const navigate = useNavigate();
  const kategori = categoryMap[form.kategori]?.label ?? "-";

  const rows = [
    { icon: User, label: "Nama", value: form.nama || "-" },
    { icon: Briefcase, label: "Kategori Pekerjaan", value: kategori },
    { icon: Wallet, label: "Tarif per Jam", value: `Rp${form.tarifMin}rb – Rp${form.tarifMaks}rb` },
    { icon: MapPin, label: "Area Kerja", value: `${form.area} (Radius 5 km)` },
  ];

  return (
    <div className="relative w-full max-w-xl rounded-[28px] border border-line bg-white px-8 py-7 text-center shadow-[0_30px_70px_rgba(13,59,46,0.12)] sm:px-12">
      <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-limesoft/60">
        <Sparkles className="absolute left-2 top-3 h-5 w-5 text-sun" aria-hidden="true" />
        <Sparkles className="absolute right-3 top-5 h-4 w-4 text-sun" aria-hidden="true" />
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-forest text-white">
          <ShieldCheck className="h-8 w-8" aria-hidden="true" />
        </span>
      </div>

      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Pendaftaran terkirim!
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-moss">
        Tim kami akan memverifikasi datamu dalam 1×24 jam. Kamu akan dapat SMS
        saat akunmu aktif.
      </p>

      <div className="mt-6 rounded-2xl border border-line p-5 text-left">
        <p className="text-sm font-bold text-ink">Ringkasan profilmu</p>
        <dl className="mt-3 divide-y divide-line">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2.5">
              <dt className="flex items-center gap-2 text-sm text-moss">
                <Icon className="h-4 w-4 text-moss" aria-hidden="true" />
                {label}
              </dt>
              <dd className="text-sm font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-limesoft/40 p-3.5 text-left">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
        <p className="text-xs text-moss">
          <span className="font-bold text-ink">Terima kasih!</span> Dengan
          verifikasi, pelanggan jadi lebih percaya dan kamu bisa dapat lebih
          banyak pekerjaan. 💚
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/pekerja/1")}
        className="ring-focus mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink font-bold text-white transition-colors hover:bg-forest"
      >
        Lihat contoh profil pekerja
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default WizardSukses;
