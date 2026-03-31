import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { ensureNoBookingConflict, validateBookingWindow } from "@/lib/bookings";
import { requireAuthenticatedUser } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { bookingInputSchema } from "@/lib/validators";
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

  return 400;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = bookingInputSchema.parse(await request.json());
    validateBookingWindow(payload);

    const currentUser = await getCurrentUser();
    requireAuthenticatedUser(currentUser);
    const aeroclubId = ensureAeroclubId(currentUser.aeroclubId);
    const supabase = createServerSupabaseClient();

    const { data: existing, error: existingError } = await supabase
      .from("bookings")
      .select("id, start_time, end_time, status")
      .eq("aeroclub_id", aeroclubId)
      .eq("airplane_id", payload.airplane_id);

    if (existingError) {
      throw new Error(existingError.message);
    }

    ensureNoBookingConflict(payload, existing ?? [], id);

    const updatePayload: Database["public"]["Tables"]["bookings"]["Update"] = {
      airplane_id: payload.airplane_id,
      pilot_id: payload.pilot_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
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
    const message = error instanceof Error ? error.message : "Nepodařilo se upravit rezervaci.";
    const status = message === "V tomto čase už je letadlo rezervované." ? 409 : resolveStatus(message);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    requireAuthenticatedUser(currentUser);
    const aeroclubId = ensureAeroclubId(currentUser.aeroclubId);
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.from("bookings").delete().eq("id", id).eq("aeroclub_id", aeroclubId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se smazat rezervaci.";
    const status = message === "Uživatel není přihlášený." ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
