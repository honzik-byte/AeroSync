import { describe, expect, expectTypeOf, it } from "vitest";
import type { AeroclubMember, Booking, BookingStatus, Database } from "@/types";

describe("AeroclubMember type", () => {
  it("umožňuje klubovou roli pilot", () => {
    const member: AeroclubMember = {
      id: "member-1",
      aeroclub_id: "club-1",
      user_id: "user-1",
      role: "pilot",
      status: "active",
      created_at: "2026-03-31T10:00:00.000Z",
    };

    expect(member.role).toBe("pilot");
  });
});

describe("Booking schema types", () => {
  it("drží rozšířený status union pro bookingy", () => {
    expectTypeOf<BookingStatus>().toEqualTypeOf<
      "pending" | "approved" | "rejected" | "cancelled"
    >();
  });

  it("obsahuje auditní booking pole a nullable request/approval vazby", () => {
    const booking: Booking = {
      id: "booking-1",
      aeroclub_id: "club-1",
      airplane_id: "plane-1",
      pilot_id: "pilot-1",
      start_time: "2026-03-31T10:00:00.000Z",
      end_time: "2026-03-31T11:00:00.000Z",
      status: "pending",
      requested_by_user_id: null,
      approved_by_user_id: "user-2",
      approved_at: null,
      rejection_reason: null,
      created_at: "2026-03-31T10:00:00.000Z",
    };

    expectTypeOf(booking).toMatchTypeOf<Booking>();
    expect(booking.approved_by_user_id).toBe("user-2");
  });

  it("má vyplněné relationships pro změněný scope", () => {
    expectTypeOf<Database["public"]["Tables"]["profiles"]["Relationships"]>().not.toEqualTypeOf<[]>();
    expectTypeOf<Database["public"]["Tables"]["bookings"]["Relationships"]>().not.toEqualTypeOf<[]>();
  });
});
