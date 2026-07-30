import { z } from "zod";

export const updateApplicationSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    nik: z.string().max(20).optional(),
    skillDescription: z.string().max(2000).optional(),
    dateOfBirth: z.string().optional(),
    experienceYears: z.number().int().min(0).max(80).optional(),
    skills: z.array(z.string().max(60)).max(30).optional(),
    serviceAreas: z.array(z.string().max(60)).max(30).optional(),
    fixedRate: z.number().int().min(0).max(100000).optional(),
    rateMax: z.number().int().min(0).max(100000).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radiusKm: z.number().int().min(1).max(100).optional(),
    workingHours: z.record(z.string(), z.unknown()).optional(),
    profilePhotoUrl: z.string().url().optional(),
    selfiePhotoUrl: z.string().url().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "Tidak ada perubahan yang dikirim",
  });
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const referenceSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  relationship: z.string().min(1, "Hubungan wajib diisi").max(100),
  phone: z.string().min(1, "Nomor telepon wajib diisi").max(30),
  description: z.string().max(1000).optional(),
});
export type ReferenceInput = z.infer<typeof referenceSchema>;

export const portfolioSchema = z.object({
  imageUrl: z.string().url("URL gambar tidak valid"),
  title: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
});
export type PortfolioInput = z.infer<typeof portfolioSchema>;

export const bookingStatusSchema = z.object({
  status: z.enum(["accepted", "scheduled", "completed", "declined"]),
});
export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;

export const withdrawalSchema = z.object({
  amount: z.number().int().min(1, "Jumlah minimal 1"),
  payoutAccountId: z.string().uuid().optional(),
});
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;

export const payoutSchema = z.object({
  type: z.enum(["bank", "ewallet"]),
  provider: z.string().min(1, "Nama bank/e-wallet wajib diisi").max(100),
  accountNumber: z.string().min(1, "Nomor wajib diisi").max(60),
  accountHolder: z.string().min(1, "Nama pemilik wajib diisi").max(255),
  isPrimary: z.boolean().optional(),
});
export type PayoutInput = z.infer<typeof payoutSchema>;
