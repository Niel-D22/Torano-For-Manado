import { z } from "zod";

export const createReportSchema = z.object({
  category: z.string().max(60).optional(),
  subject: z.string().min(3, "Judul minimal 3 karakter").max(200),
  message: z.string().min(5, "Ceritakan kendalamu lebih jelas").max(3000),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

export const updateReportSchema = z.object({
  status: z.enum(["open", "resolved"]).optional(),
  adminReply: z.string().max(3000).optional(),
});
export type UpdateReportInput = z.infer<typeof updateReportSchema>;

export const changeAdminPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
});
