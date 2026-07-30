import { z } from "zod";

export const messageSchema = z
  .object({
    type: z.enum(["text", "location", "offer", "payment", "system"]).optional(),
    body: z.string().max(4000).optional(),
    payload: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((m) => m.body !== undefined || m.payload !== undefined, {
    message: "Pesan kosong",
  });
export type MessageInput = z.infer<typeof messageSchema>;

export const startConversationSchema = z.object({
  workerProfileId: z.string().uuid(),
});
export type StartConversationInput = z.infer<typeof startConversationSchema>;
