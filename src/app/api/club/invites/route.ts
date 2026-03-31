import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { requireClubAdmin } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import type { Database } from "@/types";

export function generateInviteCode() {
  return `AERO-${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
}

function resolveStatus(message: string) {
  if (message === "Uživatel není přihlášený.") {
    return 401;
  }

  if (message === "Je potřeba role klubového admina.") {
    return 403;
  }

  return 400;
}

function ensureClubId(currentUser: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!currentUser.aeroclubId) {
    throw new Error("Nelze určit aktivní aeroklub. Zkontroluj, že máš právě jedno aktivní členství.");
  }

  return currentUser.aeroclubId;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    requireClubAdmin(currentUser);
    const aeroclubId = ensureClubId(currentUser);
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("aeroclub_invite_codes")
      .select("id, aeroclub_id, code, is_active, used_by_user_id, used_at, created_at")
      .eq("aeroclub_id", aeroclubId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, inviteCodes: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepodařilo se načíst pozvánkové kódy.";

    return NextResponse.json({ message }, { status: resolveStatus(message) });
  }
}

export async function POST(request: NextRequest) {
  try {
    await request.json().catch(() => null);

    const currentUser = await getCurrentUser();
    requireClubAdmin(currentUser);
    const aeroclubId = ensureClubId(currentUser);
    const supabase = createServerSupabaseClient();
    const inviteCode: Database["public"]["Tables"]["aeroclub_invite_codes"]["Insert"] = {
      aeroclub_id: aeroclubId,
      code: generateInviteCode(),
      is_active: true,
    };

    const { data, error } = await supabase
      .from("aeroclub_invite_codes")
      .insert(inviteCode)
      .select("id, aeroclub_id, code, is_active, used_by_user_id, used_at, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, inviteCode: data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepodařilo se vytvořit pozvánkový kód.";

    return NextResponse.json({ message }, { status: resolveStatus(message) });
  }
}
