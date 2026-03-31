import { NextRequest, NextResponse } from "next/server";
import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { pilotInputSchema } from "@/lib/validators";
import type { Database } from "@/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = pilotInputSchema.parse(await request.json());
    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();
    const updatePayload: Database["public"]["Tables"]["pilots"]["Update"] = {
      name: payload.name,
      email: payload.email,
    };

    const { error } = await supabase
      .from("pilots")
      .update(updatePayload)
      .eq("id", id)
      .eq("aeroclub_id", aeroclubId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se upravit pilota.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();

    const { error } = await supabase.from("pilots").delete().eq("id", id).eq("aeroclub_id", aeroclubId);

    if (error) {
      return NextResponse.json(
        { message: "Pilota nelze smazat, protože má navázané rezervace." },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se smazat pilota.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
