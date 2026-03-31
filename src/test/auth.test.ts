import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  authSessionCookieNames,
  getUserFromAccessToken,
} from "@/lib/auth";
import * as authModule from "@/lib/auth";
import * as currentUserModule from "@/lib/currentUser";
import {
  isClubAdminRole,
  isSuperAdminRole,
  requireClubAdmin,
} from "@/lib/authorization";
import { activeBookingStatuses } from "@/lib/bookingStatus";
import type { CurrentUser } from "@/lib/currentUser";
import type { AeroclubMember, Booking, BookingStatus, Database } from "@/types";

const {
  createClientMock,
  createServerSupabaseClientMock,
  getUserMock,
  refreshSessionMock,
  nextHeadersCookiesMock,
} = vi.hoisted(() => {
  const getUserMock = vi.fn();
  const refreshSessionMock = vi.fn();
  const createClientMock = vi.fn(() => ({
    auth: {
      getUser: getUserMock,
      refreshSession: refreshSessionMock,
    },
  }));
  const createServerSupabaseClientMock = vi.fn();
  const nextHeadersCookiesMock = vi.fn(() => ({ get: vi.fn() }));

  return {
    createClientMock,
    createServerSupabaseClientMock,
    getUserMock,
    refreshSessionMock,
    nextHeadersCookiesMock,
  };
});

vi.mock("server-only", () => ({}), { virtual: true });
vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

vi.mock("@/lib/serverSupabase", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("next/headers", () => ({
  cookies: nextHeadersCookiesMock,
}));

function makeCookieSource(
  accessToken?: string,
  refreshToken?: string,
): { get(name: string): { value: string } | undefined } {
  return {
    get(name: string) {
      if (name === authSessionCookieNames.accessToken && accessToken) {
        return { value: accessToken };
      }

      if (name === authSessionCookieNames.refreshToken && refreshToken) {
        return { value: refreshToken };
      }

      return undefined;
    },
  };
}

function makeCurrentUser(role: CurrentUser["role"]): CurrentUser {
  return {
    authUser: role === "anonymous" ? null : ({ id: "user-1" } as never),
    profile: role === "super_admin" ? ({ global_role: "super_admin" } as never) : null,
    membership:
      role === "club_admin"
        ? ({
            aeroclub_id: "club-1",
            role: "club_admin",
            status: "active",
          } as never)
        : null,
    memberships:
      role === "club_admin"
        ? [
            {
              aeroclub_id: "club-1",
              role: "club_admin",
              status: "active",
            } as never,
          ]
        : [],
    role,
    aeroclubId: role === "club_admin" ? "club-1" : null,
    isAuthenticated: role !== "anonymous",
    isSuperAdmin: role === "super_admin",
    isClubAdmin: role === "club_admin",
  };
}

function createSupabaseMock(profile: unknown, memberships: unknown[]) {
  const profileQuery: Record<string, unknown> = {};
  profileQuery.select = vi.fn(() => profileQuery);
  profileQuery.eq = vi.fn(() => profileQuery);
  profileQuery.maybeSingle = vi.fn(async () => ({ data: profile, error: null }));

  const membershipsQuery: Record<string, unknown> = {};
  membershipsQuery.select = vi.fn(() => membershipsQuery);
  membershipsQuery.eq = vi.fn(() => membershipsQuery);
  membershipsQuery.order = vi.fn(async () => ({ data: memberships, error: null }));

  return {
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return profileQuery;
      }

      if (table === "aeroclub_members") {
        return membershipsQuery;
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  getUserMock.mockReset();
  refreshSessionMock.mockReset();
  createServerSupabaseClientMock.mockReset();
  createClientMock.mockClear();
  nextHeadersCookiesMock.mockClear();
});

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

describe("bookingStatus helpers", () => {
  it("definuje active booking statuses pro pending a approved", () => {
    expect(activeBookingStatuses).toEqual(["pending", "approved"]);
    expectTypeOf<typeof activeBookingStatuses>().toEqualTypeOf<readonly ["pending", "approved"]>();
  });
});

describe("authorization helpers", () => {
  it("rozlišuje super admin a klubového admina", () => {
    expect(isSuperAdminRole("super_admin")).toBe(true);
    expect(isSuperAdminRole("user")).toBe(false);
    expect(isClubAdminRole("club_admin")).toBe(true);
    expect(isClubAdminRole("pilot")).toBe(false);
  });

  it("requireClubAdmin nepouští super admina", () => {
    expect(() => requireClubAdmin(makeCurrentUser("super_admin"))).toThrow(
      "Je potřeba role klubového admina.",
    );
  });

  it("requireClubAdmin pustí jen klubového admina", () => {
    expect(requireClubAdmin(makeCurrentUser("club_admin"))).toMatchObject({
      role: "club_admin",
      isClubAdmin: true,
    });
  });
});

describe("auth helpers", () => {
  it("vrátí uživatele přes refresh token, když access token selže", async () => {
    const refreshedUser = { id: "user-1" } as never;
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: new Error("expired") });
    refreshSessionMock.mockResolvedValueOnce({
      data: { user: refreshedUser, session: { user: refreshedUser } },
      error: null,
    });

    await expect(
      getUserFromAccessToken("expired-access-token", "valid-refresh-token"),
    ).resolves.toEqual(refreshedUser);
  });

  it("vrátí null pro neplatný token bez refresh fallbacku", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: new Error("invalid") });

    await expect(getUserFromAccessToken("invalid-access-token")).resolves.toBeNull();
  });

  it("vrací anonymní stav při neplatném access tokenu", async () => {
    const currentUserSpy = vi
      .spyOn(authModule, "getUserFromAccessToken")
      .mockResolvedValueOnce(null);

    const currentUser = await currentUserModule.getCurrentUser({
      cookies: makeCookieSource("invalid-access-token", "valid-refresh-token"),
    });

    expect(currentUserSpy).toHaveBeenCalledWith("invalid-access-token", "valid-refresh-token");
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(currentUser).toMatchObject({
      authUser: null,
      profile: null,
      membership: null,
      memberships: [],
      role: "anonymous",
      isAuthenticated: false,
    });
  });

  it("zkusí refresh token i bez access tokenu", async () => {
    const currentUserSpy = vi
      .spyOn(authModule, "getUserFromAccessToken")
      .mockResolvedValueOnce({ id: "user-1" } as never);
    createServerSupabaseClientMock.mockReturnValue(createSupabaseMock(null, []));

    const currentUser = await currentUserModule.getCurrentUser({
      cookies: makeCookieSource(undefined, "valid-refresh-token"),
    });

    expect(currentUserSpy).toHaveBeenCalledWith(undefined, "valid-refresh-token");
    expect(currentUser).toMatchObject({
      authUser: { id: "user-1" },
      profile: null,
      membership: null,
      memberships: [],
      role: "pilot",
    });
  });

  it("nevybírá první membership potichu, když má uživatel více klubů", async () => {
    vi.spyOn(authModule, "getUserFromAccessToken").mockResolvedValueOnce({ id: "user-1" } as never);
    createServerSupabaseClientMock.mockReturnValue(
      createSupabaseMock(
        {
          id: "user-1",
          global_role: null,
        },
        [
          {
            id: "membership-1",
            aeroclub_id: "club-1",
            user_id: "user-1",
            role: "pilot",
            status: "active",
            created_at: "2026-03-31T10:00:00.000Z",
          },
          {
            id: "membership-2",
            aeroclub_id: "club-2",
            user_id: "user-1",
            role: "club_admin",
            status: "active",
            created_at: "2026-03-31T11:00:00.000Z",
          },
        ],
      ),
    );

    const currentUser = await currentUserModule.getCurrentUser({
      cookies: makeCookieSource("valid-access-token", "valid-refresh-token"),
    });

    expect(currentUser.memberships).toHaveLength(2);
    expect(currentUser.membership).toBeNull();
    expect(currentUser.aeroclubId).toBeNull();
    expect(currentUser.role).toBe("pilot");
  });
});
