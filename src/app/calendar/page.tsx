import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";

export const dynamic = "force-dynamic";

function getTodayInPrague() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function CalendarPage() {
  const supabase = createServerSupabaseClient();
  const aeroclubId = await getActiveAeroclubId();
  const date = getTodayInPrague();

  const [{ data: airplanes }, { data: pilots }, { data: bookings }] = await Promise.all([
    supabase.from("airplanes").select("id, name, type").eq("aeroclub_id", aeroclubId).order("name"),
    supabase.from("pilots").select("id, name").eq("aeroclub_id", aeroclubId).order("name"),
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
        pilots={pilots ?? []}
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
}
