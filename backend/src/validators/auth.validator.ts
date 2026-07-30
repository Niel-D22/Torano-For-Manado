import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  fullName: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .max(255, "Nama lengkap terlalu panjang"),
  phone: z.string().max(30, "Nomor telepon terlalu panjang").optional(),
  // Pendaftaran publik hanya boleh sebagai pencari (customer) atau pekerja
  // (worker). Peran admin diberikan manual, bukan lewat endpoint ini.
  role: z.enum(["customer", "worker"]).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Ubah profil sendiri (pencari maupun pekerja): nama, telepon, foto.
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Nama lengkap wajib diisi")
    .max(255, "Nama lengkap terlalu panjang")
    .optional(),
  phone: z.string().max(30, "Nomor telepon terlalu panjang").optional(),
  avatarUrl: z.string().url("URL foto tidak valid").optional().or(z.literal("")),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
