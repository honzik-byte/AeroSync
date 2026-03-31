import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { requireClubAdmin } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import type { Database } from "@/types";

const MAX_INVITE_CODE_ATTEMPTS = 5;

export function generateInviteCode() {
  return `AERO-${globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
}

type InviteCodeInsertError = {
  code?: string;
  message?: string;
};

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as InviteCodeInsertError).code === "23505"
  );
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

async function createInviteCodeForClub(aeroclubId: string) {
  const supabase = createServerSupabaseClient();
  const inviteCodeBase: Omit<
    Database["public"]["Tables"]["aeroclub_invite_codes"]["Insert"],
    "code"
  > = {
    aeroclub_id: aeroclubId,
    is_active: true,
  };

  for (let attempt = 1; attempt <= MAX_INVITE_CODE_ATTEMPTS; attempt += 1) {
    const inviteCode: Database["public"]["Tables"]["aeroclub_invite_codes"]["Insert"] = {
      ...inviteCodeBase,
      code: generateInviteCode(),
    };

    const { data, error } = await supabase
      .from("aeroclub_invite_codes")
      .insert(inviteCode)
      .select("id, aeroclub_id, code, is_active, used_by_user_id, used_at, created_at")
      .single();

    if (!error && data) {
      return data;
    }

    if (!isUniqueViolation(error) || attempt === MAX_INVITE_CODE_ATTEMPTS) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Nepodařilo se vytvořit pozvánkový kód.",
      );
    }
  }

  throw new Error("Nepodařilo se vytvořit pozvánkový kód.");
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
    const inviteCode = await createInviteCodeForClub(aeroclubId);

    return NextResponse.json({ ok: true, inviteCode }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepodařilo se vytvořit pozvánkový kód.";

    return NextResponse.json({ message }, { status: resolveStatus(message) });
  }
}
