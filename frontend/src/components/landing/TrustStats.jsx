import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

// Angka yang berhitung naik saat pertama kali terlihat di layar
const CountUp = ({ to, suffix = "", decimals = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? to : 0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

const stats = [
  { to: 500, suffix: "+", label: "pekerja terverifikasi" },
  { to: 4.8, decimals: 1, label: "rating rata-rata" },
  { to: 12000, suffix: "+", label: "pekerjaan selesai" },
];

const TrustStats = () => (
  <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-28">
    {/* Strip statistik — ringan, tanpa banner berat */}
    <Reveal>
      <dl className="grid gap-10 text-center sm:grid-cols-3 sm:divide-x sm:divide-line">
        {stats.map(({ to, suffix, decimals, label }) => (
          <div key={label} className="px-4">
            <dt className="text-5xl font-extrabold tracking-tight text-[#ca8a04]">
              <CountUp to={to} suffix={suffix} decimals={decimals} />
            </dt>
            <dd className="mt-2 text-sm font-semibold text-moss">{label}</dd>
          </div>
        ))}
      </dl>
    </Reveal>

    {/* Kartu escrow — janji keamanan inti Torano */}
    <Reveal delay={0.1}>
      <div className="mx-auto mt-14 flex max-w-2xl items-start gap-4 rounded-3xl border border-line bg-white p-6 shadow-[0_24px_60px_-40px_rgba(13,59,46,0.4)] sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest/10 text-forest">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-extrabold text-ink">
            Pembayaran ditahan Torano sampai pekerjaan selesai
          </h3>
          <p className="mt-1 text-sm text-moss">
            Uang kamu aman di Torano. Kami lepas pembayaran ke pekerja setelah
            kamu konfirmasi pekerjaan beres.
          </p>
          <Link
            to="/cara-kerja"
            className="ring-focus mt-2 inline-flex items-center gap-1 text-sm font-bold text-forest hover:text-ink"
          >
            Pelajari sistem pembayaran aman
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Reveal>
  </section>
);

export default TrustStats;
