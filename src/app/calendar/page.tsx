import { syncLegacyPilotsFromAccountPeople } from "@/lib/aeroclubPeople";
import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { isSupabaseSetupError } from "@/lib/setup";
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { SetupNotice } from "@/components/ui/SetupNotice";

export const dynamic = "force-dynamic";

function getTodayInPrague() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function resolveCalendarDate(input: string | string[] | undefined) {
  const value = Array.isArray(input) ? input[0] : input;

  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return getTodayInPrague();
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string | string[] }>;
}) {
  try {
    const supabase = createServerSupabaseClient();
    const aeroclubId = await getActiveAeroclubId();
    const resolvedSearchParams = (await searchParams) ?? {};
    const date = resolveCalendarDate(resolvedSearchParams.date);

    const [accountPeople, { data: airplanes }, { data: bookings }] = await Promise.all([
      syncLegacyPilotsFromAccountPeople(supabase, aeroclubId),
      supabase.from("airplanes").select("id, name, type").eq("aeroclub_id", aeroclubId).order("name"),
      supabase
        .from("bookings")
        .select("id, airplane_id, pilot_id, start_time, end_time")
        .eq("aeroclub_id", aeroclubId)
        .order("start_time"),
    ]);

    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Kalendář</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Týdenní rezervace letadel</h2>
          <p className="mt-2 text-slate-600">
            Hlavní pracovní plocha AeroSyncu. Sloty jsou po 15 minutách a každé letadlo má svůj sloupec.
          </p>
        </div>
        <WeeklyCalendar
          airplanes={airplanes ?? []}
          pilots={accountPeople.map((person) => ({
            id: person.id,
            name: person.name,
          }))}
          bookings={(bookings ?? []).map((booking) => ({
            id: booking.id,
            airplaneId: booking.airplane_id,
            pilotId: booking.pilot_id,
            start_time: booking.start_time,
            end_time: booking.end_time,
          }))}
          date={date}
        />
      </div>
    );
  } catch (error) {
    if (isSupabaseSetupError(error)) {
      return (
        <SetupNotice
          title="Kalendář zatím nejde načíst"
          description="Aplikace je napojená na Supabase, ale v projektu ještě nejsou vytvořené tabulky AeroSyncu nebo neexistuje aktivní aeroklub."
        />
      );
    }

    throw error;
  }
}
