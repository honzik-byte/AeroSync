import "server-only"

import { createClient, type User } from "@supabase/supabase-js"
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/config"

export const authSessionCookieNames = {
  accessToken: "aerosync-access-token",
  refreshToken: "aerosync-refresh-token",
} as const

export type AuthSessionCookies = {
  accessToken?: string
  refreshToken?: string
}

export type AuthSessionCookie = {
  name: string
  value: string
  options: {
    httpOnly: boolean
    maxAge?: number
    path: string
    sameSite: "lax"
    secure: boolean
    expires?: Date
  }
}

type CookieValue = { value: string } | string | null | undefined
export type AuthCookieSource = string | { get(name: string): CookieValue } | null | undefined

const authCookieNames = [
  authSessionCookieNames.accessToken,
  authSessionCookieNames.refreshToken,
] as const

function getCookieValue(source: { get(name: string): CookieValue }, name: string) {
  const value = source.get(name)

  if (!value) {
    return undefined
  }

  return typeof value === "string" ? value : value.value
}

function parseCookieHeader(header: string) {
  return header.split(";").reduce<Record<string, string>>((accumulator, chunk) => {
    const [rawName, ...rawValue] = chunk.trim().split("=")

    if (!rawName) {
      return accumulator
    }

    const name = decodeURIComponent(rawName)
    const value = rawValue.join("=")

    if (!value) {
      return accumulator
    }

    accumulator[name] = decodeURIComponent(value)
    return accumulator
  }, {})
}

function getCookieMap(source: AuthCookieSource) {
  if (!source) {
    return {}
  }

  if (typeof source === "string") {
    return parseCookieHeader(source)
  }

  return Object.fromEntries(
    authCookieNames.map((name) => [name, getCookieValue(source, name)]).filter(([, value]) => Boolean(value)),
  ) as Partial<Record<(typeof authCookieNames)[number], string>>
}

function createBaseCookieOptions() {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  }
}

export function readAuthSessionCookies(source: AuthCookieSource = undefined): AuthSessionCookies {
  const cookieMap = getCookieMap(source)

  return {
    accessToken: cookieMap[authSessionCookieNames.accessToken],
    refreshToken: cookieMap[authSessionCookieNames.refreshToken],
  }
}

export function createAuthSessionCookies(
  session: AuthSessionCookies,
  expiresAt?: Date,
): AuthSessionCookie[] {
  const options = {
    ...createBaseCookieOptions(),
    ...(expiresAt ? { expires: expiresAt } : { maxAge: 60 * 60 * 24 * 30 }),
  }

  return authCookieNames.flatMap((name) => {
    const value =
      name === authSessionCookieNames.accessToken
        ? session.accessToken
        : session.refreshToken

    if (!value) {
      return []
    }

    return [
      {
        name,
        value,
        options,
      },
    ]
  })
}

export function clearAuthSessionCookies(): AuthSessionCookie[] {
  const options = {
    ...createBaseCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  }

  return authCookieNames.map((name) => ({
    name,
    value: "",
    options,
  }))
}

export function createAuthClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function getUserFromAccessToken(
  accessToken?: string,
  refreshToken?: string,
): Promise<User | null> {
  const supabase = createAuthClient()

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken)

    if (!error && data.user) {
      return data.user
    }
  }

  if (!refreshToken) {
    return null
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })

  if (error) {
    return null
  }

  return data.user ?? data.session?.user ?? null
}
