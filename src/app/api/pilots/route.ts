import { NextRequest, NextResponse } from "next/server";
import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { pilotInputSchema } from "@/lib/validators";
import type { Database } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const payload = pilotInputSchema.parse(await request.json());
    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();
    const insertPayload: Database["public"]["Tables"]["pilots"]["Insert"] = {
      aeroclub_id: aeroclubId,
      name: payload.name,
      email: payload.email,
    };

    const { error } = await supabase.from("pilots").insert(insertPayload);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepodařilo se vytvořit pilota.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
