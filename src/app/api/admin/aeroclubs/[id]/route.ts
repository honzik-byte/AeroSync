import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/currentUser";
import { requireSuperAdmin } from "@/lib/authorization";
import { createServerSupabaseClient } from "@/lib/serverSupabase";

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

  if (message === "Aeroklub nenalezen.") {
    return 404;
  }

  return 400;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    requireSuperAdmin(currentUser);

    const payload = aeroclubInputSchema.parse(await request.json());
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("aeroclubs")
      .update({
        name: payload.name,
        slug: payload.slug,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({ message: "Aeroklub nenalezen." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nepodařilo se upravit aeroklub.";
    return NextResponse.json({ message }, { status: resolveStatus(message) });
  }
}
