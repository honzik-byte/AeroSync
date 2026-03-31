import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/currentUser";
import { requireClubAdmin } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import type { Database } from "@/types";

const memberUpdateSchema = z
  .object({
    role: z.enum(["club_admin", "pilot"]).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine((value) => value.role !== undefined || value.status !== undefined, {
    message: "Musíš vyplnit alespoň jednu změnu.",
  });

function resolveStatus(message: string) {
  if (message === "Uživatel není přihlášený.") {
    return 401;
  }

  if (message === "Je potřeba role klubového admina.") {
    return 403;
  }

  if (message === "Člen nenalezený.") {
    return 404;
  }

  return 400;
}

function ensureClubId(currentUser: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!currentUser.aeroclubId) {
    throw new Error("Nelze určit aktivní aeroklub. Zkontroluj, že máš právě jedno aktivní členství.");
  }

  return currentUser.aeroclubId;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = memberUpdateSchema.parse(await request.json());
    const { id } = await params;
    const currentUser = await getCurrentUser();
    requireClubAdmin(currentUser);
    const aeroclubId = ensureClubId(currentUser);
    const supabase = createServerSupabaseClient();

    const { data: existingMember, error: fetchError } = await supabase
      .from("aeroclub_members")
      .select("id, aeroclub_id")
      .eq("id", id)
      .eq("aeroclub_id", aeroclubId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (!existingMember) {
      throw new Error("Člen nenalezený.");
    }

    const updatePayload: Database["public"]["Tables"]["aeroclub_members"]["Update"] = {};

    if (payload.role !== undefined) {
      updatePayload.role = payload.role;
    }

    if (payload.status !== undefined) {
      updatePayload.status = payload.status;
    }

    const { data, error } = await supabase
      .from("aeroclub_members")
      .update(updatePayload)
      .eq("id", id)
      .eq("aeroclub_id", aeroclubId)
      .select("id, aeroclub_id, user_id, role, status, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, member: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepodařilo se upravit členství.";

    return NextResponse.json({ message }, { status: resolveStatus(message) });
  }
}
