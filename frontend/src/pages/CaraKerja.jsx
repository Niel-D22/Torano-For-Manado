import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Send,
  MessagesSquare,
  Wallet,
  Wrench,
  CheckCircle2,
  Star,
  UserPlus,
  BadgeCheck,
  Power,
  Inbox,
  HandCoins,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const PENCARI = [
  { Icon: Search, title: "Cari pekerja terverifikasi", desc: "Telusuri ART, tukang, kru acara, dan montir di sekitarmu. Tandai lokasimu di peta untuk hasil terdekat." },
  { Icon: Send, title: "Ajukan permintaan", desc: "Kirim permintaan singkat berisi jenis pekerjaan, area, dan waktu. Pekerja langsung mendapat notifikasi." },
  { Icon: MessagesSquare, title: "Diskusi dan tawar harga", desc: "Ngobrol di chat, bagikan lokasi, dan sepakati harga lewat kartu penawaran." },
  { Icon: Wallet, title: "Bayar dengan aman", desc: "Bayar lewat QRIS. Dana ditahan Torano (escrow), belum diteruskan ke pekerja." },
  { Icon: Wrench, title: "Pekerjaan dikerjakan", desc: "Pekerja datang dan menyelesaikan pekerjaan sesuai kesepakatan." },
  { Icon: CheckCircle2, title: "Konfirmasi dan lepas dana", desc: "Setelah puas, konfirmasi selesai. Dana baru dilepas ke pekerja." },
  { Icon: Star, title: "Beri ulasan", desc: "Nilai pekerja agar pengguna lain terbantu memilih." },
];

const PEKERJA = [
  { Icon: UserPlus, title: "Buat akun pekerja", desc: "Daftar gratis memakai email dalam hitungan menit." },
  { Icon: BadgeCheck, title: "Verifikasi data", desc: "Lengkapi keahlian, tarif, area, foto, dan referensi. Admin meninjau sebelum kamu aktif." },
  { Icon: Power, title: "Online, siap menerima", desc: "Nyalakan status online saat siap bekerja. Matikan saat libur." },
  { Icon: Inbox, title: "Terima permintaan", desc: "Permintaan masuk muncul di Beranda dan lonceng notifikasi." },
  { Icon: MessagesSquare, title: "Sepakati dan kerjakan", desc: "Tawar harga di chat, lalu kerjakan setelah pembayaran diamankan." },
  { Icon: HandCoins, title: "Terima penghasilan", desc: "Dana dilepas ke saldomu setelah pekerjaan dikonfirmasi. Cairkan kapan saja." },
];

const StepList = ({ steps }) => (
  <ol className="space-y-4">
    {steps.map((s, i) => (
      <li key={s.title} className="flex gap-4">
        <div className="flex flex-col items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest text-white">
            <s.Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          {i < steps.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-line" />}
        </div>
        <div className="pb-2">
          <p className="flex items-center gap-2 font-extrabold text-ink">
            <span className="text-sm text-forest">{String(i + 1).padStart(2, "0")}</span>
            {s.title}
          </p>
          <p className="mt-1 text-sm text-moss">{s.desc}</p>
        </div>
      </li>
    ))}
  </ol>
);

const CaraKerja = () => {
  const [tab, setTab] = useState("pencari");
  const steps = tab === "pencari" ? PENCARI : PEKERJA;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-forest">Cara Kerja</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Dari cari sampai beres, aman di satu tempat
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-moss">
          Torano menghubungkan rumah tangga di Manado dengan pekerja terpercaya. Uang selalu ditahan
          dulu, jadi kedua pihak sama sama terlindungi.
        </p>
      </header>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-xl border border-line bg-white p-1">
          {[
            ["pencari", "Untuk Pencari"],
            ["pekerja", "Untuk Pekerja"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-5 py-2 text-sm font-bold transition-colors ${
                tab === key ? "bg-forest text-white" : "text-moss hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <StepList steps={steps} />
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl bg-forest p-8 text-center text-white">
        <ShieldCheck className="h-8 w-8" aria-hidden="true" />
        <h2 className="text-xl font-extrabold">Pembayaran selalu diamankan</h2>
        <p className="max-w-lg text-white/80">
          Dana kamu ditahan Torano dan hanya dilepas setelah pekerjaan dikonfirmasi selesai. Ada
          masalah? Ajukan sengketa dan admin menengahi.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link
            to="/keamanan"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-forest hover:bg-paper"
          >
            Pelajari keamanan
          </Link>
          <Link
            to="/cari"
            className="flex items-center gap-1.5 rounded-xl border border-white/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
          >
            Mulai cari pekerja <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaraKerja;
