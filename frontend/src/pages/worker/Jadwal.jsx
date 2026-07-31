import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MapPin, Clock, Check, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ListSkeleton } from "../../components/Skeletons";

const rupiah = (rb) => "Rp" + (Number(rb || 0) * 1000).toLocaleString("id-ID");
const jam = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-";
const tanggal = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })
    : "Belum dijadwalkan";

const badge = {
  new: { label: "Permintaan baru", cls: "bg-sun/20 text-[#8a6a00]" },
  accepted: { label: "Diterima", cls: "bg-limesoft text-forest" },
  scheduled: { label: "Terjadwal", cls: "bg-forest text-white" },
  completed: { label: "Selesai", cls: "bg-cloud text-moss" },
  declined: { label: "Ditolak", cls: "bg-red-50 text-red-600" },
};

const Card = ({ b, onDone }) => {
  const s = badge[b.status] ?? badge.scheduled;
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-ink">{b.jobTitle}</p>
          <p className="mt-0.5 text-sm text-moss">{b.customerName}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
          {s.label}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-moss">
        {b.scheduledAt && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {jam(b.scheduledAt)}
          </span>
        )}
        {b.area && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-forest" aria-hidden="true" />
            {b.area}
          </span>
        )}
        <span className="font-bold text-forest">{rupiah(b.price)}</span>
      </div>
      {(b.status === "accepted" || b.status === "scheduled") && (
        <div className="mt-3 flex gap-2">
          <Link
            to="/chat"
            className="ring-focus flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-semibold text-forest hover:border-forest"
          >
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            Chat
          </Link>
          <button
            onClick={() => onDone(b.id)}
            className="ring-focus flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-forest py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Selesaikan
          </button>
        </div>
      )}
    </article>
  );
};

const Jadwal = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/worker/me/bookings").then((r) => setItems(r.data.data));
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const complete = async (id) => {
    try {
      await api.patch(`/worker/me/bookings/${id}/status`, { status: "completed" });
      await load();
      toast.success("Pekerjaan ditandai selesai");
    } catch {
      toast.error("Gagal memperbarui");
    }
  };

  if (loading) {
    return (
      <ListSkeleton />
    );
  }

  const upcoming = items.filter((b) => ["new", "accepted", "scheduled"].includes(b.status));
  const history = items.filter((b) => ["completed", "declined"].includes(b.status));

  // Kelompokkan yang akan datang per tanggal.
  const groups = {};
  upcoming.forEach((b) => {
    const key = tanggal(b.scheduledAt);
    (groups[key] = groups[key] || []).push(b);
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Jadwal</h1>
        <p className="mt-1 text-sm text-moss">Pesanan yang akan datang dan riwayat pekerjaanmu.</p>
      </header>

      {upcoming.length === 0 && history.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-white py-16 text-center">
          <CalendarDays className="h-9 w-9 text-moss" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">Belum ada jadwal</p>
          <p className="mt-1 text-sm text-moss">Pesanan yang kamu terima akan muncul di sini.</p>
        </div>
      ) : (
        <>
          {Object.entries(groups).map(([date, list]) => (
            <section key={date} className="mb-6">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-moss">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {date}
              </h2>
              <div className="space-y-3">
                {list.map((b) => (
                  <Card key={b.id} b={b} onDone={complete} />
                ))}
              </div>
            </section>
          ))}

          {history.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 text-sm font-bold text-moss">Riwayat</h2>
              <div className="space-y-3">
                {history.map((b) => (
                  <Card key={b.id} b={b} onDone={complete} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Jadwal;
