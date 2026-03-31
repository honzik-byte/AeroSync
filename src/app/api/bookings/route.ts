import { NextRequest, NextResponse } from "next/server";
import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { ensureNoBookingConflict, validateBookingWindow } from "@/lib/bookings";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { bookingInputSchema } from "@/lib/validators";
import type { Database } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const payload = bookingInputSchema.parse(await request.json());
    validateBookingWindow(payload);

    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();

    const { data: existing, error: existingError } = await supabase
      .from("bookings")
      .select("id, start_time, end_time")
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
    };

    const { error } = await supabase.from("bookings").insert(insertPayload);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se vytvořit rezervaci.";
    const status = message === "V tomto čase už je letadlo rezervované." ? 409 : 400;
    return NextResponse.json({ message }, { status });
  }
}
