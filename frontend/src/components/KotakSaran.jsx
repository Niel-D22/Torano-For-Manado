import { useState } from "react";
import { toast } from "sonner";
import { MessageSquareHeart, Send, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import Spinner from "./Spinner";

const field =
  "ring-focus w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate focus:outline-none";

// Kotak saran publik. Isi langsung dikirim ke email tim Torano lewat backend;
// alamat tujuan tidak pernah ditampilkan di halaman.
const KotakSaran = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 5) return toast.error("Tuliskan saranmu lebih jelas");
    setBusy(true);
    try {
      await api.post("/feedback", {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        message: message.trim(),
      });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
      toast.success("Terima kasih, saranmu sudah terkirim");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Gagal mengirim saran");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-cloud">
      <div className="grid gap-0 md:grid-cols-5">
        {/* Sisi kiri: ajakan */}
        <div className="flex flex-col justify-center gap-3 bg-ink p-8 text-white md:col-span-2">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
            <MessageSquareHeart className="h-6 w-6 text-lime" aria-hidden="true" />
          </span>
          <h3 className="text-xl font-extrabold">Kotak Saran</h3>
          <p className="text-sm text-white/75">
            Punya masukan, ide, atau menemukan kendala? Tulis di sini. Pesanmu langsung sampai ke tim
            Torano dan kami baca satu per satu.
          </p>
        </div>

        {/* Sisi kanan: formulir */}
        <div className="p-6 sm:p-8 md:col-span-3">
          {sent ? (
            <div className="flex h-full min-h-52 flex-col items-center justify-center gap-3 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-limesoft text-forest">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="text-lg font-extrabold text-ink">Saranmu terkirim</p>
              <p className="max-w-sm text-sm text-moss">
                Terima kasih sudah membantu Torano jadi lebih baik untuk warga Manado.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-1 text-sm font-bold text-forest hover:underline"
              >
                Kirim saran lain
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-ink">
                    Nama <span className="font-normal text-slate">(opsional)</span>
                  </span>
                  <input
                    className={field}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Namamu"
                    maxLength={120}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-ink">
                    Email <span className="font-normal text-slate">(opsional)</span>
                  </span>
                  <input
                    type="email"
                    className={field}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Agar kami bisa membalas"
                    maxLength={200}
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-ink">Saran atau masukan</span>
                <textarea
                  className={`${field} min-h-32 resize-y`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ceritakan idemu untuk Torano…"
                  maxLength={3000}
                  required
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="ring-focus flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-6 text-sm font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
              >
                {busy ? <Spinner /> : <Send className="h-4 w-4" aria-hidden="true" />}
                {busy ? "Mengirim…" : "Kirim Saran"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default KotakSaran;
