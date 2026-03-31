import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { requireClubAdmin } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import type { Database } from "@/types";

function ensureAeroclubId(aeroclubId: string | null) {
  if (!aeroclubId) {
    throw new Error("Nelze určit aktivní aeroklub. Zkontroluj, že máš právě jedno aktivní členství.");
  }

  return aeroclubId;
}

function resolveStatus(message: string) {
  if (message === "Uživatel není přihlášený.") {
    return 401;
  }

  if (message === "Je potřeba role klubového admina.") {
    return 403;
  }

  if (message === "Rezervaci lze zamítnout jen z pending stavu.") {
    return 409;
  }

  return 400;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { rejection_reason?: unknown };
    const rejectionReason =
      typeof body.rejection_reason === "string" && body.rejection_reason.trim().length > 0
        ? body.rejection_reason.trim()
        : null;

    const currentUser = await getCurrentUser();
    const authenticatedUser = requireClubAdmin(currentUser);
    const aeroclubId = ensureAeroclubId(authenticatedUser.aeroclubId);
    const supabase = createServerSupabaseClient();

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("id", id)
      .eq("aeroclub_id", aeroclubId)
      .maybeSingle();

    if (bookingError) {
      throw new Error(bookingError.message);
    }

    if (!booking) {
      return NextResponse.json({ message: "Rezervace nebyla nalezena." }, { status: 404 });
    }

    if (booking.status !== "pending") {
      throw new Error("Rezervaci lze zamítnout jen z pending stavu.");
    }

    const updatePayload: Database["public"]["Tables"]["bookings"]["Update"] = {
      status: "rejected",
      approved_by_user_id: null,
      approved_at: null,
      rejection_reason: rejectionReason,
    };

    const { error } = await supabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", id)
      .eq("aeroclub_id", aeroclubId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se zamítnout rezervaci.";
    return NextResponse.json({ message }, { status: resolveStatus(message) });
  }
}
