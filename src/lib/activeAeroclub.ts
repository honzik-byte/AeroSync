import "server-only"
import { getActiveAeroclubSlug } from "@/lib/config"
import { createServerSupabaseClient } from "@/lib/serverSupabase"
import type { Aeroclub } from "@/types"

export async function getActiveAeroclub(): Promise<Aeroclub | null> {
  const supabase = createServerSupabaseClient()
  const slug = getActiveAeroclubSlug()

  const { data, error } = await supabase
    .from("aeroclubs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    throw new Error(`Nepodařilo se načíst aktivní aeroklub: ${error.message}`)
  }

  return data
}

export async function getActiveAeroclubId() {
  const aeroclub = await getActiveAeroclub()

  if (!aeroclub) {
    throw new Error("Aktivní aeroklub nebyl nalezen.")
  }

  return aeroclub.id
}
