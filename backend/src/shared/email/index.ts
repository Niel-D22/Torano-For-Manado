import { env } from "../../config/env.js";
import { logger } from "../logger/index.js";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Kirim email transaksional lewat Resend (HTTP API, tanpa dependensi tambahan).
 * Bila RESEND_API_KEY tidak diset, email dilewati dengan aman dan dicatat di log
 * supaya alur tetap jalan saat demo tanpa domain email terverifikasi.
 * Selalu non blocking: kegagalan email tidak pernah menggagalkan permintaan.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailInput): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.info(
      { to, subject },
      "Email dilewati (RESEND_API_KEY belum diset) - notifikasi in app tetap terkirim",
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text();
      logger.warn({ to, subject, status: res.status, detail }, "Gagal kirim email");
      return;
    }
    logger.info({ to, subject }, "Email terkirim");
  } catch (err) {
    logger.warn({ err, to, subject }, "Error saat kirim email");
  }
}

// URL logo publik (Supabase Storage). Klien email butuh URL absolut dan
// terjangkau internet, jadi localhost tidak bisa dipakai.
const LOGO_URL = `${env.SUPABASE_URL}/storage/v1/object/public/torano/brand/logo.png`;

// Kerangka email sederhana bergaya Torano, aman untuk klien email. Header putih
// dengan logo di tengah agar warna logo apa pun tetap tampil jelas.
export function emailShell(bodyHtml: string): string {
  return `
  <div style="background:#f5f3ee;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#12241d">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e6e3db;border-radius:16px;overflow:hidden">
      <div style="background:#ffffff;padding:22px 24px;text-align:center;border-bottom:1px solid #eef0ec">
        <img src="${LOGO_URL}" alt="Torano" height="40" style="height:40px;display:inline-block" />
      </div>
      <div style="height:4px;background:#0d3b2e"></div>
      <div style="padding:24px">${bodyHtml}</div>
      <div style="padding:16px 24px;border-top:1px solid #e6e3db;color:#6b7d76;font-size:12px">
        Torano, wadah jasa terpercaya di Manado.
      </div>
    </div>
  </div>`;
}
