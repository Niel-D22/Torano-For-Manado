import { useEffect, useState } from "react";
import { Star, MessageSquareQuote } from "lucide-react";
import { api } from "../../lib/api";
import Spinner from "../../components/Spinner";
import avatarFallback from "../../assets/avatar-nanda.jpg";

const Stars = ({ value, size = "h-4 w-4" }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} dari 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`${size} ${i <= value ? "fill-sun text-sun" : "fill-line text-line"}`}
        aria-hidden="true"
      />
    ))}
  </span>
);

const tanggal = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const Ulasan = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/worker/me/reviews")
      .then((r) => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-moss">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const { summary, items = [] } = data || {};
  const count = summary?.count ?? 0;
  const dist = summary?.distribution ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Ulasan</h1>
        <p className="mt-1 text-sm text-moss">Penilaian dari pelanggan yang pernah kamu kerjakan.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Ringkasan rating */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-20">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-ink">{summary?.avg ?? "-"}</p>
              <div className="mt-2 flex justify-center">
                <Stars value={Math.round(summary?.avg ?? 0)} size="h-5 w-5" />
              </div>
              <p className="mt-1 text-sm text-moss">{count} ulasan</p>
            </div>

            <div className="mt-5 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = dist[star] ?? 0;
                const pct = count ? Math.round((n / count) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="flex w-6 items-center gap-0.5 text-moss">
                      {star}
                      <Star className="h-3.5 w-3.5 fill-sun text-sun" aria-hidden="true" />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-cloud">
                      <div className="h-full rounded-full bg-sun" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-xs text-moss">{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Daftar ulasan */}
        <div className="space-y-4 lg:col-span-2">
          {items.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-white py-16 text-center">
              <MessageSquareQuote className="h-9 w-9 text-moss" aria-hidden="true" />
              <p className="mt-3 font-bold text-ink">Belum ada ulasan</p>
              <p className="mt-1 text-sm text-moss">Ulasan pelanggan akan tampil di sini.</p>
            </div>
          ) : (
            items.map((r) => (
              <article key={r.id} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex items-start gap-3">
                  <img
                    src={r.reviewerAvatar || avatarFallback}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="font-bold text-ink">{r.reviewerName}</p>
                      <span className="text-xs text-moss">{tanggal(r.createdAt)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Stars value={r.rating} />
                      {r.jobTitle && (
                        <span className="rounded-full bg-cloud px-2 py-0.5 text-xs font-semibold text-moss">
                          {r.jobTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {r.comment && <p className="mt-3 text-sm text-ink/90">{r.comment}</p>}

                {r.photos && r.photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt=""
                        className="h-20 w-20 rounded-xl border border-line object-cover"
                      />
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Ulasan;
