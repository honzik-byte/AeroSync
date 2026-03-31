import { NextRequest, NextResponse } from "next/server";
import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { ensureNoBookingConflict, validateBookingWindow } from "@/lib/bookings";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { bookingInputSchema } from "@/lib/validators";
import type { Database } from "@/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    const status = message === "V tomto čase už je letadlo rezervované." ? 409 : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();

    const { error } = await supabase.from("bookings").delete().eq("id", id).eq("aeroclub_id", aeroclubId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se smazat rezervaci.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
