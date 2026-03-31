import { z } from "zod";

export const airplaneInputSchema = z.object({
  name: z.string().trim().min(1, "Imatrikulace je povinná."),
  type: z.string().trim().min(1, "Typ letadla je povinný."),
});

export const pilotInputSchema = z.object({
  name: z.string().trim().min(1, "Jméno pilota je povinné."),
  email: z
    .string()
    .trim()
    .email("E-mail nemá správný formát.")
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
});

export const bookingInputSchema = z.object({
  airplane_id: z.string().uuid(),
  pilot_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
});
