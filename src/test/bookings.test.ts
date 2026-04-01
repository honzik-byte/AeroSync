import { describe, expect, it } from "vitest";
import {
  ensureBookingPilotAccess,
  bookingBlocksSlot,
  bookingOverlaps,
  ensureNoBookingConflict,
  validateBookingWindow,
} from "@/lib/bookings";
import type { CurrentUser } from "@/lib/currentUser";

function makeCurrentUser(role: CurrentUser["role"], authUserId = "user-1"): CurrentUser {
  return {
    authUser: role === "anonymous" ? null : ({ id: authUserId } as never),
    profile: null,
    membership: null,
    memberships: [],
    role,
    aeroclubId: "club-1",
    isAuthenticated: role !== "anonymous",
    isSuperAdmin: role === "super_admin",
    isClubAdmin: role === "club_admin",
    sessionCookiesToSet: [],
  };
}

describe("validateBookingWindow", () => {
  it("odmítne konec rezervace před začátkem", () => {
    expect(() =>
      validateBookingWindow({
        start_time: "2026-03-31T10:00:00.000Z",
        end_time: "2026-03-31T09:45:00.000Z",
      }),
    ).toThrow("Konec rezervace musí být později než začátek.");
  });

  it("povolí validní časové okno rezervace", () => {
    expect(() =>
      validateBookingWindow({
        start_time: "2026-03-31T10:00:00.000Z",
        end_time: "2026-03-31T10:45:00.000Z",
      }),
    ).not.toThrow();
  });
});

describe("bookingOverlaps", () => {
  it("vrátí true při překryvu rezervací", () => {
    expect(
      bookingOverlaps(
        {
          start_time: "2026-03-31T10:00:00.000Z",
          end_time: "2026-03-31T11:00:00.000Z",
        },
        {
          start_time: "2026-03-31T10:30:00.000Z",
          end_time: "2026-03-31T11:30:00.000Z",
        },
      ),
    ).toBe(true);
  });

  it("vrátí false, když se rezervace jen dotýkají", () => {
    expect(
      bookingOverlaps(
        {
          start_time: "2026-03-31T10:00:00.000Z",
          end_time: "2026-03-31T11:00:00.000Z",
        },
        {
          start_time: "2026-03-31T11:00:00.000Z",
          end_time: "2026-03-31T12:00:00.000Z",
        },
      ),
    ).toBe(false);
  });

  it("vrátí false, když jsou rezervace úplně oddělené", () => {
    expect(
      bookingOverlaps(
        {
          start_time: "2026-03-31T08:00:00.000Z",
          end_time: "2026-03-31T09:00:00.000Z",
        },
        {
          start_time: "2026-03-31T10:00:00.000Z",
          end_time: "2026-03-31T11:00:00.000Z",
        },
      ),
    ).toBe(false);
  });
});

describe("bookingBlocksSlot", () => {
  it("blokuje pending rezervaci", () => {
    expect(bookingBlocksSlot("pending")).toBe(true);
  });

  it("neblokuje rejected rezervaci", () => {
    expect(bookingBlocksSlot("rejected")).toBe(false);
  });
});

describe("ensureNoBookingConflict", () => {
  it("odmítne konflikt rezervace se srozumitelnou chybou", () => {
    expect(() =>
      ensureNoBookingConflict(
        {
          start_time: "2026-03-31T10:15:00.000Z",
          end_time: "2026-03-31T11:15:00.000Z",
        },
        [
          {
            id: "1",
            start_time: "2026-03-31T10:00:00.000Z",
            end_time: "2026-03-31T11:00:00.000Z",
          },
        ],
      ),
    ).toThrow("V tomto čase už je letadlo rezervované.");
  });

  it("ignoruje právě upravovanou rezervaci", () => {
    expect(() =>
      ensureNoBookingConflict(
        {
          start_time: "2026-03-31T10:00:00.000Z",
          end_time: "2026-03-31T11:00:00.000Z",
        },
        [
          {
            id: "1",
            start_time: "2026-03-31T10:00:00.000Z",
            end_time: "2026-03-31T11:00:00.000Z",
          },
        ],
        "1",
      ),
    ).not.toThrow();
  });
});

describe("ensureBookingPilotAccess", () => {
  it("dovolí pilotovi vytvořit rezervaci sám pro sebe", () => {
    expect(() =>
      ensureBookingPilotAccess(makeCurrentUser("pilot", "pilot-1"), "pilot-1"),
    ).not.toThrow();
  });

  it("odmítne pilota, který vytváří rezervaci za jiného člena", () => {
    expect(() =>
      ensureBookingPilotAccess(makeCurrentUser("pilot", "pilot-1"), "pilot-2"),
    ).toThrow("Pilot může vytvářet rezervace jen sám pro sebe.");
  });

  it("club adminovi dovolí rezervovat za kohokoliv", () => {
    expect(() =>
      ensureBookingPilotAccess(makeCurrentUser("club_admin", "admin-1"), "pilot-2"),
    ).not.toThrow();
  });
});
