import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Star,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  Check,
  Send,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuthGate } from "../lib/auth";
import Avatar from "../components/Avatar";
import { WorkerProfileSkeleton } from "../components/Skeletons";
import RequestModal from "../components/RequestModal";
import { categoryMap } from "../data/workers";

const rb = (n) => (n == null ? "-" : `Rp${n}rb`);

const Stars = ({ value }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i <= Math.round(value || 0) ? "fill-sun text-sun" : "fill-line text-line"}`}
        aria-hidden="true"
      />
    ))}
  </span>
);

const WorkerProfile = () => {
  const { id } = useParams();
  const gate = useAuthGate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reqOpen, setReqOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/workers/${id}`)
      .then((r) => setWorker(r.data.data.worker))
      .catch(() => setWorker(null))
      .finally(() => setLoading(false));
  }, [id]);

  const ajukan = () => gate(() => setReqOpen(true));

  if (loading) return <WorkerProfileSkeleton />;

  if (!worker) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink">Pekerja tidak ditemukan</h1>
        <Link
          to="/cari"
          className="mt-6 inline-flex rounded-xl bg-forest px-5 py-3 font-semibold text-white hover:bg-ink"
        >
          Kembali ke pencarian
        </Link>
      </div>
    );
  }

  const cat = categoryMap[worker.category];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar
            src={worker.photo}
            name={worker.name}
            className="h-24 w-24"
            square
            textClass="text-2xl"
          />
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
              {worker.name}
              <BadgeCheck className="h-6 w-6 fill-[#2f80ed] text-white" aria-label="Terverifikasi" />
            </h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-moss">
              {cat && <span style={{ color: cat.color }}>{cat.label}</span>}
              {worker.categoryName && !cat && worker.categoryName}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-moss">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-sun text-sun" aria-hidden="true" />
                <span className="font-bold text-ink">{worker.rating ?? "-"}</span>
                ({worker.jobs} pekerjaan)
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-forest" aria-hidden="true" />
                {worker.area} · {worker.distanceKm} km
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold text-forest">
              {rb(worker.priceMin)}
              {worker.priceMax ? `–${rb(worker.priceMax).replace("Rp", "")}` : ""}
              <span className="text-sm font-semibold text-moss"> /jam</span>
            </p>
          </div>
        </div>

        <div className="mt-5">
          {worker.available === false ? (
            <>
              <button
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line bg-cloud py-3 font-bold text-moss"
              >
                Sedang tidak menerima pekerjaan
              </button>
              <p className="mt-2 text-center text-xs text-moss">
                Pekerja ini sedang libur. Coba lagi nanti atau pilih pekerja lain.
              </p>
            </>
          ) : (
            <>
              <button
                onClick={ajukan}
                className="ring-focus flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 font-bold text-white transition-colors hover:bg-ink"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
                Ajukan Permintaan
              </button>
              <p className="mt-2 text-center text-xs text-moss">
                Kirim permintaan singkat, lalu tawar harga dan atur jadwal di chat.
              </p>
            </>
          )}
        </div>
      </div>

      <RequestModal open={reqOpen} onClose={() => setReqOpen(false)} worker={worker} />

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {worker.about && (
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-extrabold text-ink">Tentang</h2>
              <p className="mt-2 text-sm text-moss">{worker.about}</p>
            </section>
          )}

          {worker.skills?.length > 0 && (
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-extrabold text-ink">Keahlian</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {worker.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full bg-limesoft px-3 py-1 text-sm font-semibold text-forest"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {worker.portfolios?.length > 0 && (
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-extrabold text-ink">Portofolio</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {worker.portfolios.map((p) => (
                  <img
                    key={p.id}
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-24 w-24 rounded-xl border border-line object-cover"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-extrabold text-ink">
              <ShieldCheck className="h-5 w-5 text-forest" aria-hidden="true" />
              Kepercayaan
            </h2>
            <p className="mt-2 text-sm text-moss">{worker.trust}</p>
            {worker.area && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-moss">
                <MapPin className="h-4 w-4 text-forest" aria-hidden="true" />
                Melayani area {worker.serviceAreas?.join(", ") || worker.area}
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default WorkerProfile;
