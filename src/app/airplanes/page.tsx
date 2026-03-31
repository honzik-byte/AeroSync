import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { AirplanesPageClient } from "@/components/airplanes/AirplanesPageClient";

export const dynamic = "force-dynamic";

export default async function AirplanesPage() {
  const supabase = createServerSupabaseClient();
  const aeroclubId = await getActiveAeroclubId();

  const { data } = await supabase
    .from("airplanes")
    .select("id, name, type")
    .eq("aeroclub_id", aeroclubId)
    .order("name", { ascending: true });

  return <AirplanesPageClient airplanes={data ?? []} />;
}
