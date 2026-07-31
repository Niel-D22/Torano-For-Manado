import { z } from "zod";

export const offerSchema = z.object({
  conversationId: z.string().uuid("Percakapan tidak valid"),
  amount: z.coerce
    .number()
    .int("Harga harus bilangan bulat")
    .min(1000, "Minimal Rp1.000")
    .max(100000000, "Terlalu besar"),
  note: z.string().max(500).optional(),
});
export type OfferInput = z.infer<typeof offerSchema>;

export const offerResponseSchema = z.object({
  action: z.enum(["accept", "decline"]),
});
export type OfferResponseInput = z.infer<typeof offerResponseSchema>;
