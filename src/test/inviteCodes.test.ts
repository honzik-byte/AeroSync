import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/currentUser";
import {
  consumeInviteCodeIfAvailable,
  ensureInviteCodeIsUsable,
  generateInviteCode,
} from "@/lib/inviteCodes";
import { POST } from "@/app/api/club/invites/route";

const { createServerSupabaseClientMock } = vi.hoisted(() => {
  return {
    createServerSupabaseClientMock: vi.fn(),
  };
});

vi.mock("@/lib/currentUser", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/authorization", () => ({
  requireClubAdmin: vi.fn((currentUser) => currentUser),
}));

vi.mock("@/lib/serverSupabase", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

beforeEach(() => {
  vi.restoreAllMocks();
  createServerSupabaseClientMock.mockReset();
  vi.mocked(getCurrentUser).mockResolvedValue({
    aeroclubId: "club-1",
  } as Awaited<ReturnType<typeof getCurrentUser>>);
});

describe("inviteCodes", () => {
  it("atomicky odmítne spotřebu už použitého kódu", async () => {
    const updateMock = vi.fn(() => query);
    const selectMock = vi.fn(() => query);
    const eqMock = vi.fn(() => query);
    const isMock = vi.fn(() => query);
    const maybeSingleMock = vi.fn(async () => ({
      data: null,
      error: null,
    }));
    const query = {
      update: updateMock,
      select: selectMock,
      eq: eqMock,
      is: isMock,
      maybeSingle: maybeSingleMock,
    };

    createServerSupabaseClientMock.mockReturnValue({
      from: vi.fn(() => query),
    });

    await expect(
      consumeInviteCodeIfAvailable("invite-1", "user-1"),
    ).rejects.toThrow("Pozvánkový kód už byl mezitím použit.");
    expect(updateMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("id", "invite-1");
    expect(eqMock).toHaveBeenCalledWith("is_active", true);
    expect(isMock).toHaveBeenCalledWith("used_at", null);
    expect(isMock).toHaveBeenCalledWith("used_by_user_id", null);
  });

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

  it("generuje dostatečně dlouhý pozvánkový kód", () => {
    const code = generateInviteCode();

    expect(code).toMatch(/^AERO-/);
    expect(code.length).toBeGreaterThanOrEqual(16);
  });

  it("znovu zkusí vytvořit pozvánkový kód po kolizi", async () => {
    const insertMock = vi.fn(() => query);
    const selectMock = vi.fn(() => query);
    const singleMock = vi.fn(async () => {
      if (singleMock.mock.calls.length === 1) {
        return {
          data: null,
          error: {
            code: "23505",
            message: "duplicate key value violates unique constraint",
          },
        };
      }

      return {
        data: {
          id: "invite-2",
          aeroclub_id: "club-1",
          code: "AERO-2222222222222222",
          is_active: true,
          used_by_user_id: null,
          used_at: null,
          created_at: "2026-03-31T10:00:00.000Z",
        },
        error: null,
      };
    });
    const query = {
      insert: insertMock,
      select: selectMock,
      single: singleMock,
    };

    createServerSupabaseClientMock.mockReturnValue({
      from: vi.fn(() => query),
    });

    const randomUUIDMock = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("11111111-1111-1111-1111-111111111111")
      .mockReturnValueOnce("22222222-2222-2222-2222-222222222222");

    const response = await POST({
      json: vi.fn(async () => ({})),
    } as never);

    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledTimes(2);
    expect(randomUUIDMock).toHaveBeenCalledTimes(2);
  });
});
