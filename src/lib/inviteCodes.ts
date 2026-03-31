import "server-only"

import type { AeroclubInviteCode, Database } from "@/types"
import { createServerSupabaseClient } from "@/lib/serverSupabase"

type InviteCodeClient = ReturnType<typeof createServerSupabaseClient>

function normalizeInviteCode(code: string) {
  return code.trim().toUpperCase()
}

async function loadInviteCodeByCode(
  supabase: InviteCodeClient,
  code: string,
): Promise<AeroclubInviteCode | null> {
  const normalizedCode = normalizeInviteCode(code)

  const { data, error } = await supabase
    .from("aeroclub_invite_codes")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle()

  if (error) {
    throw new Error("Nepodařilo se načíst pozvánkový kód.")
  }

  return data ?? null
}

export async function ensureInviteCodeIsUsable(
  code: string,
  supabase: InviteCodeClient = createServerSupabaseClient(),
) {
  const normalizedCode = normalizeInviteCode(code)

  if (!normalizedCode) {
    throw new Error("Pozvánkový kód je povinný.")
  }

  const inviteCode = await loadInviteCodeByCode(supabase, normalizedCode)

  if (!inviteCode) {
    throw new Error("Pozvánkový kód neexistuje.")
  }

  if (!inviteCode.is_active) {
    throw new Error("Pozvánkový kód už není aktivní.")
  }

  if (inviteCode.used_by_user_id || inviteCode.used_at) {
    throw new Error("Pozvánkový kód už byl použit.")
  }

  return inviteCode
}

export async function markInviteCodeAsUsed(
  inviteCodeId: string,
  usedByUserId: string,
  supabase: InviteCodeClient = createServerSupabaseClient(),
) {
  const updatePayload: Database["public"]["Tables"]["aeroclub_invite_codes"]["Update"] = {
    used_by_user_id: usedByUserId,
    used_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("aeroclub_invite_codes")
    .update(updatePayload)
    .eq("id", inviteCodeId)

  if (error) {
    throw new Error("Pozvánkový kód se nepodařilo označit jako použitý.")
  }
}

export async function releaseInviteCodeUsage(
  inviteCodeId: string,
  supabase: InviteCodeClient = createServerSupabaseClient(),
) {
  const updatePayload: Database["public"]["Tables"]["aeroclub_invite_codes"]["Update"] = {
    used_by_user_id: null,
    used_at: null,
  }

  const { error } = await supabase
    .from("aeroclub_invite_codes")
    .update(updatePayload)
    .eq("id", inviteCodeId)

  if (error) {
    throw new Error("Pozvánkový kód se nepodařilo vrátit do původního stavu.")
  }
}

export { normalizeInviteCode, loadInviteCodeByCode }
