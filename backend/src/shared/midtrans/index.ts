import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { logger } from "../logger/index.js";

const APP_BASE = env.MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";
const API_BASE = env.MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

const authHeader = (): string =>
  "Basic " + Buffer.from(`${env.MIDTRANS_SERVER_KEY ?? ""}:`).toString("base64");

export const midtransConfigured = (): boolean =>
  Boolean(env.MIDTRANS_SERVER_KEY && env.MIDTRANS_CLIENT_KEY);

interface SnapCustomer {
  name?: string | null;
  email?: string | null;
}

// Buat token Snap (popup pembayaran QRIS/VA/e-wallet). gross dalam rupiah penuh.
export async function createSnapToken(
  orderId: string,
  gross: number,
  customer: SnapCustomer,
  itemName: string,
): Promise<{ token: string; redirectUrl: string }> {
  const res = await fetch(`${APP_BASE}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: gross },
      item_details: [
        { id: "job", price: gross, quantity: 1, name: itemName.slice(0, 50) },
      ],
      customer_details: {
        first_name: customer.name ?? "Pencari",
        email: customer.email ?? undefined,
      },
      credit_card: { secure: true },
    }),
  });
  const data = (await res.json()) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
  };
  if (!res.ok || !data.token) {
    logger.warn({ status: res.status, data }, "Gagal buat Snap token");
    throw new Error(
      data.error_messages?.join(", ") ||
        "Gagal membuat pembayaran. Periksa kunci Midtrans (butuh Sandbox).",
    );
  }
  return { token: data.token, redirectUrl: data.redirect_url ?? "" };
}

interface StatusResult {
  transaction_status?: string;
  payment_type?: string;
  transaction_id?: string;
  status_code?: string;
  gross_amount?: string;
  fraud_status?: string;
}

// Cek status transaksi ke Midtrans (dipakai untuk konfirmasi tanpa webhook).
export async function getTransactionStatus(
  orderId: string,
): Promise<StatusResult> {
  const res = await fetch(`${API_BASE}/v2/${orderId}/status`, {
    headers: { Authorization: authHeader(), Accept: "application/json" },
  });
  return (await res.json()) as StatusResult;
}

// "held" bila pembayaran benar benar lunas (settlement/capture non-deny).
export function isPaid(s: StatusResult): boolean {
  const t = s.transaction_status;
  if (t === "settlement") return true;
  if (t === "capture" && s.fraud_status !== "deny") return true;
  return false;
}

// Verifikasi tanda tangan notifikasi webhook Midtrans.
export function verifySignature(body: {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
}): boolean {
  const raw =
    (body.order_id ?? "") +
    (body.status_code ?? "") +
    (body.gross_amount ?? "") +
    (env.MIDTRANS_SERVER_KEY ?? "");
  const hash = crypto.createHash("sha512").update(raw).digest("hex");
  return hash === body.signature_key;
}
