import { z } from "zod";

// Permintaan awal dari pencari ke pekerja (gerbang sebelum chat, Model C).
export const createRequestSchema = z.object({
  workerProfileId: z.string().uuid("Pekerja tidak valid"),
  jobTitle: z
    .string()
    .min(3, "Jelaskan pekerjaan minimal 3 karakter")
    .max(255, "Terlalu panjang"),
  area: z.string().max(120, "Area terlalu panjang").optional(),
  preferredAt: z.string().optional(), // ISO datetime, opsional
  note: z.string().max(1000, "Catatan terlalu panjang").optional(),
});
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
