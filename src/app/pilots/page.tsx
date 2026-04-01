import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { listActiveAeroclubAccountPeople } from "@/lib/aeroclubPeople";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { isSupabaseSetupError } from "@/lib/setup";
import { PilotsPageClient } from "@/components/pilots/PilotsPageClient";
import { SetupNotice } from "@/components/ui/SetupNotice";

export const dynamic = "force-dynamic";

export default async function PilotsPage() {
  try {
    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();
    const pilots = await listActiveAeroclubAccountPeople(supabase, aeroclubId);

    return <PilotsPageClient pilots={pilots} />;
  } catch (error) {
    if (isSupabaseSetupError(error)) {
      return (
        <SetupNotice
          title="Piloti zatím nejdou načíst"
          description="V Supabase ještě není nahrané schéma AeroSyncu nebo chybí aktivní aeroklub podle zadaného slug."
        />
      );
    }

    throw error;
  }
}
