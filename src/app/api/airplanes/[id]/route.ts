import { NextRequest, NextResponse } from "next/server";
import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { airplaneInputSchema } from "@/lib/validators";
import type { Database } from "@/types";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = airplaneInputSchema.parse(await request.json());
    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();
    const updatePayload: Database["public"]["Tables"]["airplanes"]["Update"] = {
      name: payload.name,
      type: payload.type,
    };

    const { error } = await supabase
      .from("airplanes")
      .update(updatePayload)
      .eq("id", id)
      .eq("aeroclub_id", aeroclubId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se upravit letadlo.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();

    const { error } = await supabase.from("airplanes").delete().eq("id", id).eq("aeroclub_id", aeroclubId);

    if (error) {
      return NextResponse.json(
        { message: "Letadlo nelze smazat, protože má navázané rezervace." },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se smazat letadlo.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
