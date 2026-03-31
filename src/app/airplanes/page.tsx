import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { isSupabaseSetupError } from "@/lib/setup";
import { AirplanesPageClient } from "@/components/airplanes/AirplanesPageClient";
import { SetupNotice } from "@/components/ui/SetupNotice";

export const dynamic = "force-dynamic";

export default async function AirplanesPage() {
  try {
    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();

    const { data } = await supabase
      .from("airplanes")
      .select("id, name, type")
      .eq("aeroclub_id", aeroclubId)
      .order("name", { ascending: true });

    return <AirplanesPageClient airplanes={data ?? []} />;
  } catch (error) {
    if (isSupabaseSetupError(error)) {
      return (
        <SetupNotice
          title="Letadla zatím nejdou načíst"
          description="V Supabase ještě není nahrané schéma AeroSyncu nebo chybí aktivní aeroklub podle zadaného slug."
        />
      );
    }

    throw error;
  }
}
