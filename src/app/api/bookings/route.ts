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

export async function POST(request: NextRequest) {
  try {
    const payload = bookingInputSchema.parse(await request.json());
    validateBookingWindow(payload);

    const currentUser = await getCurrentUser();
    const authenticatedUser = requireAuthenticatedUser(currentUser);
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

    ensureNoBookingConflict(payload, existing ?? []);

    const insertPayload: Database["public"]["Tables"]["bookings"]["Insert"] = {
      aeroclub_id: aeroclubId,
      airplane_id: payload.airplane_id,
      pilot_id: payload.pilot_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      status: "pending",
      requested_by_user_id: authenticatedUser.authUser?.id ?? null,
    };

    const { error } = await supabase.from("bookings").insert(insertPayload);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se vytvořit rezervaci.";
    const status = message === "V tomto čase už je letadlo rezervované." ? 409 : resolveStatus(message);
    return NextResponse.json({ message }, { status });
  }
}
