import { z } from "zod";

// Kotak saran publik (tanpa login). Email pengirim opsional.
export const createFeedbackSchema = z.object({
  name: z.string().max(120).optional(),
  email: z.string().email("Format email tidak valid").max(200).optional().or(z.literal("")),
  message: z.string().min(5, "Tuliskan saranmu lebih jelas").max(3000),
});
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
