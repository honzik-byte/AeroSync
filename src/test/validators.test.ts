import { describe, expect, it } from "vitest";
import { bookingInputSchema } from "@/lib/validators";

describe("bookingInputSchema", () => {
  it("povolí ISO datumy s časovou zónou jako offset", () => {
    expect(() =>
      bookingInputSchema.parse({
        airplane_id: "11111111-1111-4111-8111-111111111111",
        pilot_id: "22222222-2222-4222-8222-222222222222",
        start_time: "2026-04-01T08:00:00.000+02:00",
        end_time: "2026-04-01T09:45:00.000+02:00",
      }),
    ).not.toThrow();
  });
});
