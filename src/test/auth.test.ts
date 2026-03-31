import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  authSessionCookieNames,
  applyAuthSessionCookies,
  createAuthSessionCookies,
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
    sessionCookiesToSet: [],
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
  it("vrátí uživatele i cookie payloady přes refresh token, když access token selže", async () => {
    const refreshedUser = { id: "user-1" } as never;
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: new Error("expired") });
    refreshSessionMock.mockResolvedValueOnce({
      data: {
        user: refreshedUser,
        session: {
          user: refreshedUser,
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
          expires_at: 1774936800,
        },
      },
      error: null,
    });

    await expect(getUserFromAccessToken("expired-access-token", "valid-refresh-token")).resolves.toEqual({
      user: refreshedUser,
      sessionCookiesToSet: [
        {
          name: authSessionCookieNames.accessToken,
          value: "new-access-token",
          options: {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: false,
            expires: new Date(1774936800 * 1000),
          },
        },
        {
          name: authSessionCookieNames.refreshToken,
          value: "new-refresh-token",
          options: {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: false,
            expires: new Date(1774936800 * 1000),
          },
        },
      ],
    });
  });

  it("vrátí null pro neplatný token bez refresh fallbacku", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: new Error("invalid") });

    await expect(getUserFromAccessToken("invalid-access-token")).resolves.toEqual({
      user: null,
      sessionCookiesToSet: [],
    });
  });

  it("aplikuje session cookies do cookie targetu", () => {
    const target = {
      set: vi.fn(),
    };
    const cookies = createAuthSessionCookies({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
    const [accessCookie, refreshCookie] = cookies;

    const returnedTarget = applyAuthSessionCookies(target, cookies);

    expect(returnedTarget).toBe(target);
    expect(target.set).toHaveBeenCalledTimes(2);
    expect(target.set).toHaveBeenNthCalledWith(
      1,
      authSessionCookieNames.accessToken,
      "new-access-token",
      accessCookie?.options,
    );
    expect(target.set).toHaveBeenNthCalledWith(
      2,
      authSessionCookieNames.refreshToken,
      "new-refresh-token",
      refreshCookie?.options,
    );
  });

  it("vrací anonymní stav při neplatném access tokenu", async () => {
    const currentUserSpy = vi
      .spyOn(authModule, "getUserFromAccessToken")
      .mockResolvedValueOnce({ user: null, sessionCookiesToSet: [] });

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
      sessionCookiesToSet: [],
    });
  });

  it("zkusí refresh token i bez access tokenu a vrací payloady pro cookies", async () => {
    const currentUserSpy = vi
      .spyOn(authModule, "getUserFromAccessToken")
      .mockResolvedValueOnce({
        user: { id: "user-1" } as never,
        sessionCookiesToSet: [
          {
            name: authSessionCookieNames.accessToken,
            value: "new-access-token",
            options: {
              httpOnly: true,
              path: "/",
              sameSite: "lax",
              secure: false,
              maxAge: 60 * 60 * 24 * 30,
            },
          },
        ],
      });
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
      sessionCookiesToSet: [
        {
          name: authSessionCookieNames.accessToken,
          value: "new-access-token",
          options: {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: false,
            maxAge: 60 * 60 * 24 * 30,
          },
        },
      ],
    });
  });

  it("nevybírá první membership potichu, když má uživatel více klubů", async () => {
    vi.spyOn(authModule, "getUserFromAccessToken").mockResolvedValueOnce({
      user: { id: "user-1" } as never,
      sessionCookiesToSet: [],
    });
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
