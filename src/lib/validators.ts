import { z } from "zod";

export const bookingInputSchema = z.object({
  airplane_id: z.string().uuid(),
  pilot_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
});
