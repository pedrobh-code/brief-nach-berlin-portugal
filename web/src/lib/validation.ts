import { z } from "zod";
export const letterInputSchema = z
  .object({
    constituencyId: z.string().regex(/^\d{1,2}$/),
    representativeId: z.string().regex(/^\d{1,8}$/),
    issue: z.string().trim().min(30).max(3000),
    tone: z.enum(["cordial", "direto", "firme"]),
    length: z.enum(["curta", "normal"]),
    consent: z.literal(true),
    website: z.string().max(0).optional(),
  })
  .strict();
export type LetterInput = z.infer<typeof letterInputSchema>;
export const emailInputSchema = z
  .object({
    email: z.string().trim().email().max(254),
    letter: z.string().trim().min(50).max(12000),
    ticket: z.string().min(20).max(1000),
    consent: z.literal(true),
  })
  .strict();
