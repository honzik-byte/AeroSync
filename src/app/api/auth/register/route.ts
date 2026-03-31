import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAuthClient, createAuthSessionCookies, applyAuthSessionCookies } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/serverSupabase"
import {
  consumeInviteCodeIfAvailable,
  ensureInviteCodeIsUsable,
  releaseInviteCodeUsage,
} from "@/lib/inviteCodes"
import type { Database } from "@/types"

const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Jméno a příjmení je povinné."),
  email: z.string().trim().email("E-mail nemá správný formát."),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků."),
  inviteCode: z.string().trim().min(1, "Pozvánkový kód je povinný."),
})

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const auth = createAuthClient()
  let createdUserId: string | null = null
  let inviteCodeId: string | null = null
  let profileCreated = false
  let memberCreated = false
  let inviteMarkedUsed = false

  try {
    const payload = registerSchema.parse(await request.json())
    const inviteCode = await ensureInviteCodeIsUsable(payload.inviteCode, supabase)
    inviteCodeId = inviteCode.id

    const { data: createdUser, error: createUserError } = await auth.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName,
      },
    })

    if (createUserError || !createdUser.user) {
      throw new Error(createUserError?.message ?? "Nepodařilo se vytvořit uživatele.")
    }

    createdUserId = createdUser.user.id

    const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
      id: createdUser.user.id,
      email: payload.email.trim().toLowerCase(),
      full_name: payload.fullName.trim(),
      global_role: "user",
    }

    const memberPayload: Database["public"]["Tables"]["aeroclub_members"]["Insert"] = {
      aeroclub_id: inviteCode.aeroclub_id,
      user_id: createdUser.user.id,
      role: "pilot",
      status: "active",
    }

    const profileResult = await supabase.from("profiles").insert(profilePayload)

    if (profileResult.error) {
      throw new Error(profileResult.error.message)
    }

    profileCreated = true

    const memberResult = await supabase.from("aeroclub_members").insert(memberPayload)

    if (memberResult.error) {
      throw new Error(memberResult.error.message)
    }

    memberCreated = true

    await consumeInviteCodeIfAvailable(inviteCode.id, createdUser.user.id, supabase)
    inviteMarkedUsed = true

    const signInResult = await auth.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    })

    if (signInResult.error || !signInResult.data.session) {
      throw new Error("Nepodařilo se uživatele přihlásit.")
    }

    const response = NextResponse.json({ ok: true }, { status: 201 })
    applyAuthSessionCookies(
      response.cookies,
      createAuthSessionCookies(
        {
          accessToken: signInResult.data.session.access_token,
          refreshToken: signInResult.data.session.refresh_token,
        },
        signInResult.data.session.expires_at
          ? new Date(signInResult.data.session.expires_at * 1000)
          : undefined,
      ),
    )

    return response
  } catch (error) {
    if (inviteMarkedUsed && inviteCodeId) {
      try {
        await releaseInviteCodeUsage(inviteCodeId, supabase)
      } catch {
        // Best effort rollback only.
      }
    }

    if (memberCreated && createdUserId) {
      try {
        await supabase.from("aeroclub_members").delete().eq("user_id", createdUserId)
      } catch {
        // Best effort rollback only.
      }
    }

    if (profileCreated && createdUserId) {
      try {
        await supabase.from("profiles").delete().eq("id", createdUserId)
      } catch {
        // Best effort rollback only.
      }
    }

    if (createdUserId) {
      try {
        await auth.auth.admin.deleteUser(createdUserId)
      } catch {
        // Best effort rollback only.
      }
    }

    const message = error instanceof Error ? error.message : "Registrace se nezdařila."

    return NextResponse.json({ message }, { status: 400 })
  }
}
