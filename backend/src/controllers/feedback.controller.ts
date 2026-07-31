import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { sendEmail, emailShell } from "../shared/email/index.js";
import { sendSuccess } from "../shared/http/index.js";

// Escape sederhana agar input pengguna aman ditaruh di HTML email.
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// POST /api/feedback — kotak saran publik. Isi dikirim ke email tim Torano
// (alamat tujuan disimpan di server, tidak pernah diekspos ke frontend).
export async function createFeedback(req: Request, res: Response): Promise<void> {
  const { name, email, message } = req.body as {
    name?: string;
    email?: string;
    message: string;
  };

  const pengirim = name?.trim() ? esc(name.trim()) : "Warga (anonim)";
  const emailPengirim = email?.trim() || "";

  const html = emailShell(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#0d3b2e">Saran baru dari Torano</h2>
    <p style="margin:0 0 16px;color:#6b7d76;font-size:14px">Dikirim lewat kotak saran halaman Tentang Kami.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr>
        <td style="padding:6px 0;color:#6b7d76;width:88px">Nama</td>
        <td style="padding:6px 0;color:#12241d;font-weight:bold">${pengirim}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#6b7d76">Email</td>
        <td style="padding:6px 0;color:#12241d">${emailPengirim ? esc(emailPengirim) : "tidak diisi"}</td>
      </tr>
    </table>
    <div style="margin-top:16px;padding:14px 16px;background:#f5f3ee;border-radius:12px;color:#12241d;font-size:14px;white-space:pre-line">${esc(message.trim())}</div>
  `);

  // Non blocking: kegagalan email tidak menggagalkan respons ke pengguna.
  void sendEmail({
    to: env.FEEDBACK_TO,
    subject: `Saran Torano dari ${pengirim}`,
    html,
    ...(emailPengirim ? { replyTo: emailPengirim } : {}),
  });

  sendSuccess(res, { received: true }, { statusCode: 201, message: "Saran terkirim" });
}
