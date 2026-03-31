import { NextRequest, NextResponse } from "next/server"
import { createAuthClient, createAuthSessionCookies, applyAuthSessionCookies } from "@/lib/auth"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().trim().email("E-mail nemá správný formát."),
  password: z.string().min(1, "Heslo je povinné."),
})

export async function POST(request: NextRequest) {
  try {
    const payload = loginSchema.parse(await request.json())
    const supabase = createAuthClient()
    const { data, error } = await supabase.auth.signInWithPassword(payload)

    if (error || !data.session) {
      throw new Error("Neplatný e-mail nebo heslo.")
    }

    const response = NextResponse.json({ ok: true })
    applyAuthSessionCookies(
      response.cookies,
      createAuthSessionCookies(
        {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        },
        data.session.expires_at ? new Date(data.session.expires_at * 1000) : undefined,
      ),
    )

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Přihlášení se nezdařilo."
    return NextResponse.json({ message }, { status: 400 })
  }
}
