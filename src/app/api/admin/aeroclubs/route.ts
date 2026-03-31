import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/currentUser";
import { requireSuperAdmin } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import type { Database } from "@/types";

const aeroclubInputSchema = z.object({
  name: z.string().trim().min(1, "Název aeroklubu je povinný."),
  slug: z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .refine((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: "Slug může obsahovat jen malá písmena, čísla a pomlčky.",
    }),
});

function resolveStatus(message: string) {
  if (message === "Uživatel není přihlášený.") {
    return 401;
  }

  if (message === "Je potřeba role super admina.") {
    return 403;
  }

  return 400;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    requireSuperAdmin(currentUser);

    const payload = aeroclubInputSchema.parse(await request.json());
    const supabase = createServerSupabaseClient();
    const insertPayload: Database["public"]["Tables"]["aeroclubs"]["Insert"] = {
      name: payload.name,
      slug: payload.slug,
    };

    const { data, error } = await supabase
      .from("aeroclubs")
      .insert(insertPayload)
      .select("id, name, slug, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, aeroclub: data }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepodařilo se vytvořit aeroklub.";
    return NextResponse.json({ message }, { status: resolveStatus(message) });
  }
}
