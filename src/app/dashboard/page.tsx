import { getActiveAeroclubId } from "@/lib/activeAeroclub";
import { createServerSupabaseClient } from "@/lib/serverSupabase";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { TodayBookings } from "@/components/dashboard/TodayBookings";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

function getTodayInPrague() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const aeroclubId = await getActiveAeroclubId();
  const today = getTodayInPrague();
  const todayStart = `${today}T00:00:00.000+02:00`;
  const todayEnd = `${today}T23:59:59.999+02:00`;

  const [{ count: airplanesCount }, { count: pilotsCount }, { data: airplanes }, { data: pilots }, { data: bookings }] = await Promise.all([
    supabase.from("airplanes").select("*", { count: "exact", head: true }).eq("aeroclub_id", aeroclubId),
    supabase.from("pilots").select("*", { count: "exact", head: true }).eq("aeroclub_id", aeroclubId),
    supabase.from("airplanes").select("id, name").eq("aeroclub_id", aeroclubId),
    supabase.from("pilots").select("id, name").eq("aeroclub_id", aeroclubId),
    supabase
      .from("bookings")
      .select("id, airplane_id, pilot_id, start_time, end_time")
      .eq("aeroclub_id", aeroclubId)
      .gte("start_time", todayStart)
      .lte("start_time", todayEnd)
      .order("start_time"),
  ]);

  const airplaneMap = new Map((airplanes ?? []).map((airplane) => [airplane.id, airplane.name]));
  const pilotMap = new Map((pilots ?? []).map((pilot) => [pilot.id, pilot.name]));

  const todayBookings =
    bookings?.map((booking) => ({
      id: booking.id,
      pilotName: pilotMap.get(booking.pilot_id) ?? "Neznámý pilot",
      airplaneName: airplaneMap.get(booking.airplane_id) ?? "Neznámé letadlo",
      startLabel: new Intl.DateTimeFormat("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Prague",
      }).format(new Date(booking.start_time)),
      endLabel: new Intl.DateTimeFormat("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Prague",
      }).format(new Date(booking.end_time)),
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Přehled</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            Rezervace pod kontrolou
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Základní přehled letadel, pilotů a dnešních rezervací pro rychlou orientaci.
          </p>
        </div>
        <Button>Nová rezervace</Button>
      </div>

      <DashboardCards
        airplanesCount={airplanesCount ?? 0}
        pilotsCount={pilotsCount ?? 0}
        todayBookingsCount={todayBookings.length}
      />
      <TodayBookings bookings={todayBookings} />
    </div>
  );
}
