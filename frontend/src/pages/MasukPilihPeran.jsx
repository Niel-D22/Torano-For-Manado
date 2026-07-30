import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, ArrowRight, ShieldCheck, Lock, Users } from "lucide-react";
import ilustrasiCari from "../assets/PendaftaranPekerja/assetCariPekerjaan.png";
import ilustrasiTerima from "../assets/PendaftaranPekerja/assetTerimaPekerjaan.png";
import AuthShell from "../components/auth/AuthShell";

// Satu akun bisa dua peran — di sini user memilih mau masuk sebagai apa dulu,
// pilihan ini menentukan pintu masuk (beranda pencari vs area mitra).
const roles = [
  {
    id: "pencari",
    illustration: ilustrasiCari,
    title: "Masuk sebagai Pencari",
    desc: "Cari & sewa ART, tukang, kru acara, dan montir di sekitarmu",
  },
  {
    id: "pekerja",
    illustration: ilustrasiTerima,
    title: "Masuk sebagai Pekerja",
    desc: "Kelola pekerjaan dan terima orderan sebagai mitra",
  },
];

const trust = [
  { icon: ShieldCheck, title: "Aman & Terpercaya", desc: "Verifikasi ketat untuk semua pengguna" },
  { icon: Lock, title: "Privasi Terjaga", desc: "Data kamu aman bersama kami" },
  { icon: Users, title: "Komunitas Lokal", desc: "Dikenal warga, dipercaya bersama" },
];

const MasukPilihPeran = () => {
  const [selected, setSelected] = useState("pencari");
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const lanjut = () => {
    const next = params.get("next");
    const q = next ? `?next=${encodeURIComponent(next)}` : "";
    navigate(`/login/${selected}${q}`);
  };

  return (
    <AuthShell>
      <div className="relative w-full max-w-3xl rounded-[28px] border border-line bg-white px-6 py-7 shadow-[0_30px_70px_rgba(13,59,46,0.12)] sm:px-10">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            Masuk sebagai apa?
          </h1>
          <p className="mt-1.5 text-sm text-moss">
            Satu akun bisa dua-duanya. Pilih mau masuk ke mana dulu.
          </p>
        </div>

        <fieldset className="mt-7 grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Pilih peran</legend>
          {roles.map((role) => {
            const active = selected === role.id;
            return (
              <button
                key={role.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(role.id)}
                onDoubleClick={lanjut}
                className={`ring-focus relative rounded-3xl border-2 p-5 text-left transition-colors ${
                  active
                    ? "border-forest bg-limesoft/40"
                    : "border-line bg-white hover:border-leaf/60"
                }`}
              >
                {active && (
                  <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-forest text-white">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
                <img
                  src={role.illustration}
                  alt=""
                  className="mx-auto h-28 w-auto object-contain"
                />
                <div className="mt-3 flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                      active ? "border-forest" : "border-line"
                    }`}
                    aria-hidden="true"
                  >
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-forest" />}
                  </span>
                  <span>
                    <span className="block font-extrabold text-ink">{role.title}</span>
                    <span className="mt-0.5 block text-sm text-moss">{role.desc}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </fieldset>

        <button
          type="button"
          onClick={lanjut}
          className="ring-focus mx-auto mt-7 flex h-12 w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-ink font-bold text-white transition-colors hover:bg-forest"
        >
          Lanjut
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>

        <p className="mt-4 text-center text-sm text-moss">
          Belum punya akun?{" "}
          <Link to="/daftar" className="font-bold text-forest hover:underline">
            Daftar di sini
          </Link>
        </p>

        <div className="mt-7 grid gap-5 border-t border-line pt-6 sm:grid-cols-3">
          {trust.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-ink">{title}</p>
                <p className="text-xs text-moss">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthShell>
  );
};

export default MasukPilihPeran;
