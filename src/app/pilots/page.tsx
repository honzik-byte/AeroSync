import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { PilotsPageClient } from "@/components/pilots/PilotsPageClient";

export const dynamic = "force-dynamic";

export default async function PilotsPage() {
  const supabase = createServerSupabaseClient();
  const aeroclubId = await getActiveAeroclubId();

  const { data } = await supabase
    .from("pilots")
    .select("id, name, email")
    .eq("aeroclub_id", aeroclubId)
    .order("name", { ascending: true });

  return <PilotsPageClient pilots={data ?? []} />;
}
