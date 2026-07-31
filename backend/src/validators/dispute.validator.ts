import { z } from "zod";

export const createDisputeSchema = z.object({
  paymentId: z.string().uuid("Transaksi tidak valid"),
  reason: z.string().min(3, "Pilih atau tulis alasan").max(120),
  description: z.string().max(2000).optional(),
  evidence: z.array(z.string().url()).max(6).optional(),
});
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;

export const resolveDisputeSchema = z.object({
  resolution: z.enum(["release", "refund", "split"]),
  adminNote: z.string().min(1, "Catatan admin wajib diisi").max(2000),
});
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
