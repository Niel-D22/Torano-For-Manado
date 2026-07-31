import { z } from "zod";

export const createReviewSchema = z.object({
  paymentId: z.string().uuid("Transaksi tidak valid"),
  rating: z.coerce.number().int().min(1, "Pilih rating").max(5),
  comment: z.string().max(1000).optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
