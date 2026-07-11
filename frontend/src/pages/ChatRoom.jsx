import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getChatWorker, getSeedMessages } from "../data/chats";
import { categoryMap } from "../data/workers";
import MidtransSheet from "../components/MidtransSheet";
import {
  TextBubble,
  SystemNote,
  LocationBubble,
  OfferBubble,
  PaymentBubble,
} from "../components/ChatBubbles";
import {
  ArrowIcon,
  PhoneIcon,
  PlusIcon,
  SendIcon,
  PinIcon,
  WalletIcon,
} from "../components/icons";

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const now = () =>
  new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

const quickReplies = [
  "Bisa hari ini?",
  "Berapa lama pengerjaan?",
  "Terima kasih 🙏",
];

const ChatRoom = () => {
  const { id } = useParams();
  const worker = getChatWorker(id);
  const cat = categoryMap[worker.category];

  const [messages, setMessages] = useState(() => getSeedMessages(Number(id)));
  const [text, setText] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const [offerDraft, setOfferDraft] = useState("");
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [pay, setPay] = useState({ open: false, amount: 0, msgId: null });

  const seqRef = useRef(1000);
  const nid = () => ++seqRef.current;
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const push = (m) => setMessages((prev) => [...prev, { id: nid(), ...m }]);

  const sendText = (t) => {
    if (!t.trim()) return;
    push({ from: "me", type: "text", text: t.trim(), time: now() });
    setText("");
  };

  const shareLocation = () => {
    setPlusOpen(false);
    push({
      from: "me",
      type: "location",
      title: "Lokasi saya saat ini",
      address: "Jl. Sam Ratulangi No. 45, Wanea, Manado",
      lat: 1.4779,
      lng: 124.8412,
      time: now(),
    });
  };

  const sendOffer = () => {
    const amount = parseInt(offerDraft, 10);
    if (!amount) return;
    push({
      from: "me",
      type: "offer",
      amount,
      status: "pending",
      history: [`Kamu menawar Rp${amount}rb`],
      time: now(),
    });
    setOfferDraft("");
    setShowOfferInput(false);
  };

  const acceptOffer = (offer) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === offer.id ? { ...m, status: "accepted" } : m)),
    );
    push({ type: "system", text: `Harga disepakati Rp${offer.amount}.000` });
    push({
      type: "payment",
      amount: offer.amount,
      status: "pending",
      time: now(),
    });
  };

  const counterOffer = (offer) => {
    const lower = Math.max(offer.amount - 15, 50);
    push({
      from: "me",
      type: "offer",
      amount: lower,
      status: "pending",
      history: [`Ditawar Rp${offer.amount}rb`, `Kamu tawar balik Rp${lower}rb`],
      time: now(),
    });
  };

  const openPay = (payment) =>
    setPay({ open: true, amount: payment.amount, msgId: payment.id });

  const onPaid = (methodLabel) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === pay.msgId
          ? { ...m, status: "paid", method: methodLabel }
          : m,
      ),
    );
    setPay({ open: false, amount: 0, msgId: null });
    push({ type: "system", text: "Pembayaran berhasil · dana ditahan (escrow)" });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-lg flex-col border-x border-line bg-paper">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-line bg-white px-3 py-3">
        <Link to="/chat" className="text-moss hover:text-ink">
          <ArrowIcon className="h-5 w-5 rotate-180" />
        </Link>
        <div
          className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white"
          style={{ background: cat.color }}
        >
          {initials(worker.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{worker.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-moss">
            <span className="h-2 w-2 rounded-full bg-leaf" />
            Online · {cat.short}
          </p>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-forest hover:bg-cloud">
          <PhoneIcon className="h-4 w-4" />
        </button>
      </header>

      {/* Pesan */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <SystemNote msg={{ text: "Hari ini" }} />
        {messages.map((m) => {
          if (m.type === "text") return <TextBubble key={m.id} msg={m} />;
          if (m.type === "system") return <SystemNote key={m.id} msg={m} />;
          if (m.type === "location")
            return <LocationBubble key={m.id} msg={m} />;
          if (m.type === "offer")
            return (
              <OfferBubble
                key={m.id}
                msg={m}
                onAccept={acceptOffer}
                onCounter={counterOffer}
              />
            );
          if (m.type === "payment")
            return <PaymentBubble key={m.id} msg={m} onPay={openPay} />;
          return null;
        })}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      <div className="flex gap-2 overflow-x-auto border-t border-line bg-white px-3 pt-2.5">
        {quickReplies.map((q) => (
          <button
            key={q}
            onClick={() => sendText(q)}
            className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-moss hover:border-forest hover:text-ink"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input penawaran (opsional) */}
      {showOfferInput && (
        <div className="flex items-center gap-2 border-t border-line bg-limesoft/40 px-3 py-2">
          <WalletIcon className="h-5 w-5 text-forest" />
          <span className="text-sm font-semibold text-ink">Rp</span>
          <input
            type="number"
            value={offerDraft}
            onChange={(e) => setOfferDraft(e.target.value)}
            placeholder="120"
            className="w-24 rounded-lg border border-line bg-white px-2 py-1.5 text-sm focus:outline-none"
          />
          <span className="text-sm text-moss">ribu / hari</span>
          <button
            onClick={sendOffer}
            className="ml-auto rounded-lg bg-forest px-3 py-1.5 text-sm font-semibold text-white hover:bg-ink"
          >
            Kirim penawaran
          </button>
        </div>
      )}

      {/* Composer */}
      <div className="relative flex items-center gap-2 border-t border-line bg-white px-3 py-3">
        <button
          onClick={() => setPlusOpen((v) => !v)}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors ${
            plusOpen
              ? "border-forest bg-forest text-white"
              : "border-line text-forest hover:bg-cloud"
          }`}
        >
          <PlusIcon className="h-5 w-5" />
        </button>

        {plusOpen && (
          <div className="absolute bottom-16 left-3 z-20 w-52 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
            <button
              onClick={shareLocation}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-ink hover:bg-paper"
            >
              <PinIcon className="h-4 w-4 text-leaf" /> Bagikan lokasi
            </button>
            <button
              onClick={() => {
                setShowOfferInput(true);
                setPlusOpen(false);
              }}
              className="flex w-full items-center gap-2.5 border-t border-line px-4 py-3 text-sm font-medium text-ink hover:bg-paper"
            >
              <WalletIcon className="h-4 w-4 text-forest" /> Kirim penawaran harga
            </button>
          </div>
        )}

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendText(text)}
          placeholder="Tulis pesan…"
          className="h-10 flex-1 rounded-xl border border-line bg-paper px-4 text-sm focus:outline-none"
        />
        <button
          onClick={() => sendText(text)}
          className="ring-focus grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest text-white hover:bg-ink"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>

      <MidtransSheet
        open={pay.open}
        amount={pay.amount}
        onClose={() => setPay({ open: false, amount: 0, msgId: null })}
        onSuccess={onPaid}
      />
    </div>
  );
};

export default ChatRoom;
