import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureInviteCodeIsUsable } from "@/lib/inviteCodes";

const { createServerSupabaseClientMock } = vi.hoisted(() => {
  return {
    createServerSupabaseClientMock: vi.fn(),
  };
});

vi.mock("@/lib/serverSupabase", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

beforeEach(() => {
  vi.restoreAllMocks();
  createServerSupabaseClientMock.mockReset();
});

describe("inviteCodes", () => {
  it("odmítne už použitý pozvánkový kód", async () => {
    const selectMock = vi.fn(() => query);
    const eqMock = vi.fn(() => query);
    const singleMock = vi.fn(async () => ({
      data: {
        id: "invite-1",
        aeroclub_id: "club-1",
        code: "AERO-123",
        is_active: true,
        used_by_user_id: "user-1",
        used_at: "2026-03-31T10:00:00.000Z",
        created_at: "2026-03-31T09:00:00.000Z",
      },
      error: null,
    }));
    const query = {
      select: selectMock,
      eq: eqMock,
      maybeSingle: singleMock,
    };

    createServerSupabaseClientMock.mockReturnValue({
      from: vi.fn(() => query),
    });

    await expect(ensureInviteCodeIsUsable("AERO-123")).rejects.toThrow(
      "Pozvánkový kód už byl použit.",
    );
  });
});
