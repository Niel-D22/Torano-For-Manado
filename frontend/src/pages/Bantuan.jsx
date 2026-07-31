import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LifeBuoy, Send, CheckCircle2, Clock } from "lucide-react";
import { api } from "../lib/api";
import Spinner from "../components/Spinner";
import { ListSkeleton } from "../components/Skeletons";

const CATEGORIES = [
  "Pembayaran & escrow",
  "Keamanan & penipuan",
  "Masalah dengan mitra",
  "Masalah dengan pelanggan",
  "Akun & profil",
  "Lainnya",
];

const inputCls =
  "ring-focus w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-slate focus:outline-none";

const tgl = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const Bantuan = () => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/reports/me");
      setReports(data.data || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (subject.trim().length < 4) return toast.error("Judul terlalu pendek");
    if (message.trim().length < 10) return toast.error("Ceritakan kendala minimal 10 karakter");
    setBusy(true);
    try {
      await api.post("/reports", { category, subject: subject.trim(), message: message.trim() });
      toast.success("Laporan terkirim ke admin");
      setSubject("");
      setMessage("");
      setCategory(CATEGORIES[0]);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal mengirim laporan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-white">
          <LifeBuoy className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Bantuan & Lapor Kendala</h1>
          <p className="text-sm text-moss">Sampaikan masalahmu, tim Torano akan menindaklanjuti.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 rounded-2xl border border-line bg-white p-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Kategori</span>
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Judul singkat</span>
          <input
            className={inputCls}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Contoh: Dana escrow belum cair"
            maxLength={120}
            required
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-bold text-ink">Ceritakan kendalamu</span>
          <textarea
            className={`${inputCls} min-h-[130px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Jelaskan kronologi, ID transaksi, atau nama pihak terkait bila ada."
            maxLength={2000}
            required
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="ring-focus mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
        >
          {busy ? <Spinner /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {busy ? "Mengirim…" : "Kirim Laporan"}
        </button>
      </form>

      <h2 className="mt-8 mb-3 text-lg font-extrabold text-ink">Laporan saya</h2>
      {loading ? (
        <ListSkeleton count={3} title={false} />
      ) : reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-cloud/50 p-6 text-center text-sm text-moss">
          Belum ada laporan. Kirim laporan pertamamu lewat formulir di atas.
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <article key={r.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{r.subject}</p>
                  <p className="mt-0.5 text-xs text-slate">
                    {r.category} · {tgl(r.createdAt)}
                  </p>
                </div>
                {r.status === "resolved" ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Selesai
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Diproses
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-moss">{r.message}</p>
              {r.adminReply && (
                <div className="mt-3 rounded-xl border border-forest/20 bg-forest/5 p-3">
                  <p className="text-xs font-bold text-forest">Balasan admin</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink">{r.adminReply}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bantuan;
