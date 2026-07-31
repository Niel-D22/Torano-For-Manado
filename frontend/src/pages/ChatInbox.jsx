import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Send,
  MessageSquareText,
  Search,
  ArrowLeft,
  Tag,
  Wallet,
  Plus,
  ShieldCheck,
  Check,
  X,
  MapPin,
  Star,
} from "lucide-react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { loadSnap } from "../lib/snap";
import Spinner from "../components/Spinner";
import Avatar from "../components/Avatar";
import DisputeModal from "../components/DisputeModal";
import ReviewModal from "../components/ReviewModal";

const jam = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";

const rp = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");

// Normalisasi baris realtime (snake_case) ke bentuk API (camelCase).
const norm = (r) => ({
  id: r.id,
  conversationId: r.conversation_id ?? r.conversationId,
  senderProfileId: r.sender_profile_id ?? r.senderProfileId,
  type: r.type,
  body: r.body,
  payload: r.payload,
  createdAt: r.created_at ?? r.createdAt,
});

const quickReplies = [
  "Siap, saya di lokasi",
  "15 menit lagi sampai",
  "Bisa besok pagi",
  "Ada yang ingin ditanyakan?",
];

const ChatInbox = () => {
  const [convos, setConvos] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [disputePaymentId, setDisputePaymentId] = useState(null);
  const [reviewPaymentId, setReviewPaymentId] = useState(null);
  const [sharingLoc, setSharingLoc] = useState(false);
  const scrollRef = useRef(null);

  const reloadThread = useCallback(async () => {
    if (!activeId) return;
    const r = await api.get(`/chat/conversations/${activeId}/messages`);
    setThread(r.data.data);
  }, [activeId]);

  useEffect(() => {
    api
      .get("/chat/conversations")
      .then((r) => {
        setConvos(r.data.data);
        if (r.data.data[0]) setActiveId(r.data.data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setThread(null);
    let alive = true;
    api
      .get(`/chat/conversations/${activeId}/messages`)
      .then((r) => alive && setThread(r.data.data));

    const channel = supabase
      .channel(`msg-${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          const m = norm(payload.new);
          // Kartu penawaran/pembayaran berubah lewat update payload, jadi muat
          // ulang thread agar status ikut tersinkron, bukan sekadar menambah.
          if (m.type === "offer" || m.type === "payment" || m.type === "system") {
            reloadThread();
            return;
          }
          setThread((t) =>
            t && t.conversation.id === activeId && !t.messages.find((x) => x.id === m.id)
              ? { ...t, messages: [...t.messages, m] }
              : t,
          );
        },
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [activeId, reloadThread]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread?.messages?.length]);

  const send = async (bodyText) => {
    const body = (bodyText ?? text).trim();
    if (!body || !activeId) return;
    setText("");
    setSending(true);
    try {
      const { data } = await api.post(`/chat/conversations/${activeId}/messages`, {
        type: "text",
        body,
      });
      const m = data.data.message;
      setThread((t) =>
        t && !t.messages.find((x) => x.id === m.id) ? { ...t, messages: [...t.messages, m] } : t,
      );
    } catch {
      toast.error("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Perangkat tidak mendukung lokasi");
      return;
    }
    setSharingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const { data } = await api.post(`/chat/conversations/${activeId}/messages`, {
            type: "location",
            body: "Lokasi dibagikan",
            payload: { lat: latitude, lng: longitude },
          });
          const m = data.data.message;
          setThread((t) =>
            t && !t.messages.find((x) => x.id === m.id) ? { ...t, messages: [...t.messages, m] } : t,
          );
        } catch {
          toast.error("Gagal membagikan lokasi");
        } finally {
          setSharingLoc(false);
        }
      },
      () => {
        toast.error("Izin lokasi ditolak");
        setSharingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const sendOffer = async () => {
    const amt = Number(offerAmount);
    if (!amt || amt < 1000) {
      toast.error("Masukkan harga minimal Rp1.000");
      return;
    }
    try {
      await api.post("/payments/offer", {
        conversationId: activeId,
        amount: amt,
        note: offerNote.trim() || undefined,
      });
      setShowOffer(false);
      setOfferAmount("");
      setOfferNote("");
      reloadThread();
    } catch {
      toast.error("Gagal mengirim penawaran");
    }
  };

  const respondOffer = async (messageId, action) => {
    try {
      await api.post(`/payments/offer/${messageId}/respond`, { action });
      if (action === "accept") toast.success("Penawaran diterima");
      reloadThread();
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal memproses penawaran");
    }
  };

  const confirmPay = async (paymentId) => {
    try {
      const { data } = await api.post(`/payments/${paymentId}/confirm`);
      if (data.data.status === "held")
        toast.success("Pembayaran berhasil. Dana ditahan Torano.");
    } catch {
      /* diamkan, muat ulang di bawah */
    } finally {
      reloadThread();
    }
  };

  const pay = async (paymentId) => {
    try {
      const { data } = await api.post(`/payments/${paymentId}/snap`);
      const { token, clientKey, isProduction } = data.data;
      const snap = await loadSnap(clientKey, isProduction);
      snap.pay(token, {
        onSuccess: () => confirmPay(paymentId),
        onPending: () => confirmPay(paymentId),
        onError: () => toast.error("Pembayaran gagal"),
        onClose: () => {},
      });
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal memulai pembayaran");
    }
  };

  const release = async (paymentId) => {
    try {
      await api.post(`/payments/${paymentId}/release`);
      toast.success("Dana dilepas ke pekerja");
      reloadThread();
    } catch (e) {
      toast.error(e.response?.data?.error?.message || "Gagal melepas dana");
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-moss">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const active = convos.find((c) => c.id === activeId);
  const other = thread?.conversation?.other;
  const meId = thread?.conversation?.meId;
  const iAmCustomer = thread?.conversation?.iAmCustomer;

  return (
    <div className="mx-auto max-w-7xl sm:px-6 sm:py-6">
      <div className="grid h-[calc(100dvh-4rem)] overflow-hidden bg-white sm:h-[calc(100dvh-7rem)] sm:rounded-2xl sm:border sm:border-line md:grid-cols-[300px_1fr]">
        {/* Daftar percakapan */}
        <aside className={`flex flex-col border-r border-line ${activeId ? "hidden md:flex" : "flex"}`}>
          <div className="border-b border-line p-4">
            <h1 className="text-lg font-extrabold text-ink">Pesan</h1>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-paper px-3">
              <Search className="h-4 w-4 text-moss" aria-hidden="true" />
              <input
                placeholder="Cari percakapan..."
                className="h-9 w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convos.length === 0 ? (
              <div className="grid place-items-center py-16 text-center text-sm text-moss">
                Belum ada percakapan.
              </div>
            ) : (
              convos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors ${
                    c.id === activeId ? "bg-limesoft/40" : "hover:bg-cloud"
                  }`}
                >
                  <Avatar
                    src={c.avatarUrl}
                    name={c.name}
                    className="h-11 w-11 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-bold text-ink">{c.name}</p>
                      <span className="shrink-0 text-xs text-moss">{jam(c.lastMessageAt)}</span>
                    </div>
                    <p className="truncate text-sm text-moss">{c.lastMessage || "Mulai percakapan"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Ruang chat */}
        <section className={`flex min-w-0 flex-col overflow-hidden ${activeId ? "flex" : "hidden md:flex"}`}>
          {!active ? (
            <div className="grid flex-1 place-items-center text-center text-moss">
              <div>
                <MessageSquareText className="mx-auto h-10 w-10" aria-hidden="true" />
                <p className="mt-2 text-sm">Pilih percakapan untuk mulai chat.</p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-line px-4 py-3">
                <button
                  onClick={() => setActiveId(null)}
                  className="rounded-lg p-1.5 text-moss hover:bg-cloud md:hidden"
                  aria-label="Kembali"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <Avatar
                  src={other?.avatarUrl || active.avatarUrl}
                  name={other?.name || active.name}
                  className="h-10 w-10"
                />
                <div>
                  <p className="font-bold text-ink">{other?.name || active.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-forest">
                    <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                    Online
                  </p>
                </div>
              </header>

              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-paper px-4 py-4">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
                {!thread ? (
                  <div className="grid place-items-center py-10">
                    <Spinner className="h-6 w-6 text-forest" />
                  </div>
                ) : (
                  thread.messages.map((m) => {
                    const mine = m.senderProfileId === meId;

                    if (m.type === "offer") {
                      const p = m.payload || {};
                      const st = p.status;
                      return (
                        <div key={m.id} className="flex justify-center">
                          <div className="w-full max-w-xs rounded-2xl border border-line bg-white p-4 shadow-sm">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-moss">
                              <Tag className="h-3.5 w-3.5" aria-hidden="true" /> Penawaran harga
                            </p>
                            <p className="mt-1 text-2xl font-extrabold text-forest">{rp(p.amount)}</p>
                            {p.note && <p className="mt-1 text-sm text-moss">{p.note}</p>}
                            {st === "pending" ? (
                              mine ? (
                                <p className="mt-3 text-xs text-moss">Menunggu jawaban lawan bicara...</p>
                              ) : (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() => respondOffer(m.id, "accept")}
                                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-forest py-2 text-sm font-bold text-white hover:bg-ink"
                                  >
                                    <Check className="h-4 w-4" /> Terima
                                  </button>
                                  <button
                                    onClick={() => respondOffer(m.id, "decline")}
                                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-line py-2 text-sm font-bold text-moss hover:text-ink"
                                  >
                                    <X className="h-4 w-4" /> Tolak
                                  </button>
                                </div>
                              )
                            ) : (
                              <span
                                className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                                  st === "accepted"
                                    ? "bg-limesoft text-forest"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {st === "accepted" ? "Disepakati" : "Ditolak"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (m.type === "payment") {
                      const p = m.payload || {};
                      const st = p.status;
                      return (
                        <div key={m.id} className="flex justify-center">
                          <div className="w-full max-w-xs rounded-2xl border border-forest/30 bg-white p-4 shadow-sm">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-moss">
                              <Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Pembayaran aman (escrow)
                            </p>
                            <p className="mt-1 text-2xl font-extrabold text-ink">{rp(p.amount)}</p>
                            <div className="mt-2 space-y-1 border-t border-line pt-2 text-xs text-moss">
                              <div className="flex justify-between">
                                <span>Diterima pekerja</span>
                                <span className="font-semibold text-ink">{rp(p.workerAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Biaya layanan Torano</span>
                                <span>{rp(p.platformFee)}</span>
                              </div>
                            </div>

                            {st === "pending" &&
                              (iAmCustomer ? (
                                <button
                                  onClick={() => pay(p.paymentId)}
                                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-forest py-2.5 text-sm font-bold text-white hover:bg-ink"
                                >
                                  <Wallet className="h-4 w-4" /> Bayar dengan QRIS
                                </button>
                              ) : (
                                <p className="mt-3 text-xs text-moss">Menunggu pembayaran dari pencari.</p>
                              ))}

                            {st === "held" && (
                              <>
                                <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-limesoft/50 px-2 py-1.5 text-xs font-semibold text-forest">
                                  <ShieldCheck className="h-4 w-4" /> Dana ditahan Torano
                                </p>
                                {iAmCustomer ? (
                                  <button
                                    onClick={() => release(p.paymentId)}
                                    className="mt-2 w-full rounded-xl border border-forest py-2.5 text-sm font-bold text-forest hover:bg-limesoft/40"
                                  >
                                    Pekerjaan selesai, lepas dana
                                  </button>
                                ) : (
                                  <p className="mt-2 text-xs text-moss">Menunggu pencari mengonfirmasi selesai.</p>
                                )}
                                <button
                                  onClick={() => setDisputePaymentId(p.paymentId)}
                                  className="mt-2 w-full rounded-xl py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  Ada masalah? Laporkan sengketa
                                </button>
                              </>
                            )}

                            {st === "disputed" && (
                              <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-sun/15 px-2 py-1.5 text-xs font-semibold text-[#8a6a00]">
                                <ShieldCheck className="h-4 w-4" /> Sedang disengketakan, menunggu admin
                              </p>
                            )}

                            {st === "released" && (
                              <>
                                <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-limesoft/50 px-2 py-1.5 text-xs font-semibold text-forest">
                                  <Check className="h-4 w-4" /> Dana dilepas ke pekerja
                                </p>
                                {iAmCustomer &&
                                  (p.reviewed ? (
                                    <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-moss">
                                      <Star className="h-3.5 w-3.5 fill-sun text-sun" /> Sudah kamu ulas
                                    </p>
                                  ) : (
                                    <button
                                      onClick={() => setReviewPaymentId(p.paymentId)}
                                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-forest py-2 text-sm font-bold text-forest hover:bg-limesoft/40"
                                    >
                                      <Star className="h-4 w-4" /> Beri ulasan
                                    </button>
                                  ))}
                              </>
                            )}

                            {st === "refunded" && (
                              <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-600">
                                <Check className="h-4 w-4" /> Dana dikembalikan ke pencari
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (m.type === "location") {
                      const p = m.payload || {};
                      const maps = `https://www.google.com/maps?q=${p.lat},${p.lng}`;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <a
                            href={maps}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full max-w-[240px] overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-forest"
                          >
                            <div className="grid h-24 place-items-center bg-limesoft/40">
                              <MapPin className="h-8 w-8 text-forest" aria-hidden="true" />
                            </div>
                            <div className="p-3">
                              <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                                <MapPin className="h-4 w-4 text-forest" /> Lokasi dibagikan
                              </p>
                              <p className="mt-0.5 truncate text-xs text-moss">
                                {Number(p.lat).toFixed(5)}, {Number(p.lng).toFixed(5)}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-forest">Buka di peta</p>
                            </div>
                          </a>
                        </div>
                      );
                    }

                    if (m.type === "system") {
                      return (
                        <div key={m.id} className="flex justify-center">
                          <div className="max-w-[85%] rounded-2xl border border-forest/20 bg-limesoft/40 px-4 py-3 text-sm text-forest">
                            <p className="mb-1 flex items-center gap-1.5 font-bold">
                              <Send className="h-3.5 w-3.5" aria-hidden="true" />
                              Permintaan
                            </p>
                            <p className="whitespace-pre-line text-ink">{m.body}</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            mine
                              ? "rounded-br-sm bg-forest text-white"
                              : "rounded-bl-sm border border-line bg-white text-ink"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-moss"}`}>
                            {jam(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                </div>
              </div>

              {/* Panel penawaran harga */}
              {showOffer && (
                <div className="mx-auto mt-3 w-[calc(100%-2rem)] max-w-2xl shrink-0 rounded-2xl border border-forest/30 bg-limesoft/20 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-forest">
                    <Tag className="h-4 w-4" /> Kirim penawaran harga
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-moss">Rp</span>
                    <input
                      type="number"
                      min="1000"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="150000"
                      className="ring-focus h-10 w-36 rounded-xl border border-line bg-white px-3 text-sm focus:outline-none"
                    />
                    <input
                      value={offerNote}
                      onChange={(e) => setOfferNote(e.target.value)}
                      placeholder="Catatan (opsional)"
                      className="ring-focus h-10 flex-1 rounded-xl border border-line bg-white px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setShowOffer(false)}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-moss hover:text-ink"
                    >
                      Batal
                    </button>
                    <button
                      onClick={sendOffer}
                      className="rounded-lg bg-forest px-4 py-1.5 text-sm font-bold text-white hover:bg-ink"
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              )}

              {/* Balasan cepat (sembunyi saat panel penawaran terbuka; gulir horizontal di mobile) */}
              {!showOffer && (
                <div className="mx-auto flex w-full max-w-2xl shrink-0 gap-2 overflow-x-auto border-t border-line px-4 pt-3 [scrollbar-width:none]">
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="shrink-0 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-moss transition-colors hover:border-forest hover:text-forest"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="mx-auto flex w-full max-w-2xl shrink-0 items-center gap-2 p-4"
              >
                <button
                  type="button"
                  onClick={() => setShowOffer((v) => !v)}
                  aria-label="Kirim penawaran harga"
                  className={`ring-focus grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors ${
                    showOffer
                      ? "border-forest bg-limesoft/50 text-forest"
                      : "border-line text-moss hover:border-forest hover:text-forest"
                  }`}
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={shareLocation}
                  disabled={sharingLoc}
                  aria-label="Bagikan lokasi"
                  className="ring-focus grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line text-moss transition-colors hover:border-forest hover:text-forest disabled:opacity-60"
                >
                  {sharingLoc ? <Spinner className="h-5 w-5" /> : <MapPin className="h-5 w-5" aria-hidden="true" />}
                </button>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="ring-focus h-12 flex-1 rounded-full border border-line bg-paper px-4 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="ring-focus grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest text-white transition-colors hover:bg-ink disabled:opacity-60"
                  aria-label="Kirim"
                >
                  {sending ? <Spinner className="h-5 w-5" /> : <Send className="h-5 w-5" aria-hidden="true" />}
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      <DisputeModal
        open={!!disputePaymentId}
        paymentId={disputePaymentId}
        onClose={() => setDisputePaymentId(null)}
        onDone={reloadThread}
      />
      <ReviewModal
        open={!!reviewPaymentId}
        paymentId={reviewPaymentId}
        workerName={other?.name}
        onClose={() => setReviewPaymentId(null)}
        onDone={reloadThread}
      />
    </div>
  );
};

export default ChatInbox;
