import { z } from "zod";

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const rejectSchema = z.object({
  reason: z
    .string()
    .min(1, "Alasan penolakan wajib diisi")
    .max(500, "Alasan terlalu panjang"),
});
export type RejectInput = z.infer<typeof rejectSchema>;

export const updateReferenceSchema = z
  .object({
    contacted: z.boolean().optional(),
    adminNote: z.string().max(1000, "Catatan terlalu panjang").optional(),
  })
  .refine((v) => v.contacted !== undefined || v.adminNote !== undefined, {
    message: "Tidak ada perubahan yang dikirim",
  });
export type UpdateReferenceInput = z.infer<typeof updateReferenceSchema>;
