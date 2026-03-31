import "server-only"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/serverSupabase"
import { getUserFromAccessToken, readAuthSessionCookies, type AuthCookieSource } from "@/lib/auth"
import type { AeroclubMember, Profile } from "@/types"
import type { User } from "@supabase/supabase-js"

export type CurrentUserRole = "super_admin" | "club_admin" | "pilot" | "anonymous"

export type CurrentUser = {
  authUser: User | null
  profile: Profile | null
  membership: AeroclubMember | null
  memberships: AeroclubMember[]
  role: CurrentUserRole
  aeroclubId: string | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isClubAdmin: boolean
}

export type CurrentUserOptions = {
  aeroclubId?: string
  cookies?: AuthCookieSource
}

export function resolveCurrentUserRole(
  authUser: User | null,
  profile: Profile | null,
  membership: AeroclubMember | null,
): CurrentUserRole {
  if (!authUser) {
    return "anonymous"
  }

  if (profile?.global_role === "super_admin") {
    return "super_admin"
  }

  if (membership?.status === "active" && membership.role === "club_admin") {
    return "club_admin"
  }

  return "pilot"
}

export function buildCurrentUserContext(input: {
  authUser: User | null
  profile: Profile | null
  membership: AeroclubMember | null
  memberships?: AeroclubMember[]
}): CurrentUser {
  const memberships = input.memberships ?? (input.membership ? [input.membership] : [])
  const role = resolveCurrentUserRole(input.authUser, input.profile, input.membership)

  return {
    authUser: input.authUser,
    profile: input.profile,
    membership: input.membership,
    memberships,
    role,
    aeroclubId: input.membership?.aeroclub_id ?? null,
    isAuthenticated: Boolean(input.authUser),
    isSuperAdmin: role === "super_admin",
    isClubAdmin: role === "club_admin",
  }
}

async function loadMemberships(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  aeroclubId?: string,
) {
  let query = supabase
    .from("aeroclub_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")

  if (aeroclubId) {
    query = query.eq("aeroclub_id", aeroclubId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    throw new Error("Nepodařilo se načíst členství uživatele.")
  }

  return data ?? []
}

async function loadProfile(supabase: ReturnType<typeof createServerSupabaseClient>, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw new Error("Nepodařilo se načíst profil uživatele.")
  }

  return data ?? null
}

export async function getCurrentUser(options: CurrentUserOptions = {}): Promise<CurrentUser> {
  const sessionCookies = readAuthSessionCookies(options.cookies ?? cookies())

  if (!sessionCookies.accessToken) {
    return buildCurrentUserContext({
      authUser: null,
      profile: null,
      membership: null,
      memberships: [],
    })
  }

  const authUser = await getUserFromAccessToken(sessionCookies.accessToken)

  if (!authUser) {
    return buildCurrentUserContext({
      authUser: null,
      profile: null,
      membership: null,
      memberships: [],
    })
  }

  const supabase = createServerSupabaseClient()
  const [profile, memberships] = await Promise.all([
    loadProfile(supabase, authUser.id),
    loadMemberships(supabase, authUser.id, options.aeroclubId),
  ])

  const membership = options.aeroclubId
    ? memberships.find((item) => item.aeroclub_id === options.aeroclubId) ?? null
    : memberships[0] ?? null

  return buildCurrentUserContext({
    authUser,
    profile,
    membership,
    memberships,
  })
}

export function isCurrentUserForAeroclub(
  currentUser: CurrentUser,
  aeroclubId: string,
) {
  return currentUser.memberships.some((membership) => membership.aeroclub_id === aeroclubId)
}
