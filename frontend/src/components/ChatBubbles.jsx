import { Link } from "react-router-dom";
import MiniMap from "./MiniMap";
import {
  PinIcon,
  WalletIcon,
  CheckIcon,
  ClockIcon,
  ShieldIcon,
  ArrowIcon,
} from "./icons";

const Row = ({ me, children }) => (
  <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
    {children}
  </div>
);

export const TextBubble = ({ msg }) => {
  const me = msg.from === "me";
  return (
    <Row me={me}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          me
            ? "rounded-br-md bg-forest text-white"
            : "rounded-bl-md border border-line bg-white text-ink"
        }`}
      >
        {msg.text}
        <span
          className={`mt-1 block text-[10px] ${me ? "text-white/70" : "text-moss"}`}
        >
          {msg.time}
        </span>
      </div>
    </Row>
  );
};

export const SystemNote = ({ msg }) => (
  <div className="flex justify-center">
    <span className="rounded-full bg-cloud px-3 py-1 text-xs font-medium text-moss">
      {msg.text}
    </span>
  </div>
);

export const LocationBubble = ({ msg }) => {
  const me = msg.from === "me";
  return (
    <Row me={me}>
      <div className="w-64 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="h-32 w-full">
          <MiniMap lat={msg.lat} lng={msg.lng} />
        </div>
        <div className="p-3">
          <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <PinIcon className="h-4 w-4 text-leaf" />
            {msg.title}
          </p>
          <p className="mt-0.5 text-xs text-moss">{msg.address}</p>
          <Link
            to="/peta"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-cloud py-2 text-xs font-semibold text-forest hover:bg-limesoft"
          >
            Buka di peta <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Row>
  );
};

export const OfferBubble = ({ msg, onAccept, onCounter }) => {
  const me = msg.from === "me";
  const accepted = msg.status === "accepted";
  return (
    <Row me={me}>
      <div className="w-64 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-moss">
          <WalletIcon className="h-4 w-4 text-forest" />
          Penawaran harga
        </p>
        <p className="mt-1 text-2xl font-extrabold text-ink">
          Rp{msg.amount}.000
          <span className="text-xs font-medium text-moss"> /hari</span>
        </p>

        <div className="mt-3 space-y-1 border-l-2 border-line pl-3">
          {msg.history.map((h, i) => (
            <p key={i} className="text-[11px] text-moss">
              {h}
            </p>
          ))}
        </div>

        {accepted ? (
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-limesoft py-2 text-sm font-semibold text-forest">
            <CheckIcon className="h-4 w-4" /> Harga disepakati
          </div>
        ) : !me ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => onCounter(msg)}
              className="rounded-lg border border-line py-2 text-sm font-semibold text-ink hover:border-forest"
            >
              Tawar balik
            </button>
            <button
              onClick={() => onAccept(msg)}
              className="rounded-lg bg-forest py-2 text-sm font-semibold text-white hover:bg-ink"
            >
              Terima
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-cloud py-2 text-xs font-medium text-moss">
            <ClockIcon className="h-3.5 w-3.5" /> Menunggu jawaban
          </div>
        )}
      </div>
    </Row>
  );
};

export const PaymentBubble = ({ msg, onPay }) => {
  const paid = msg.status === "paid";
  return (
    <div className="flex justify-center">
      <div className="w-72 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-moss">
            <ShieldIcon className="h-4 w-4 text-forest" />
            Pembayaran aman
          </p>
          {paid && (
            <span className="rounded-full bg-limesoft px-2 py-0.5 text-[10px] font-bold text-forest">
              LUNAS
            </span>
          )}
        </div>
        <p className="mt-1 text-2xl font-extrabold text-ink">
          Rp{msg.amount}.000
        </p>

        {paid ? (
          <div className="mt-2">
            <p className="text-xs text-moss">
              Dibayar via {msg.method} · ditahan sistem (escrow) sampai
              pekerjaan selesai.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-xs text-moss">
              Dana ditahan sistem, cair ke pekerja setelah kerja beres.
            </p>
            <button
              onClick={() => onPay(msg)}
              className="ring-focus mt-3 w-full rounded-lg bg-forest py-2.5 text-sm font-semibold text-white hover:bg-ink"
            >
              Bayar via Midtrans
            </button>
          </>
        )}
      </div>
    </div>
  );
};
