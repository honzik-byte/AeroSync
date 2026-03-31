import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { TodayBookings } from "@/components/dashboard/TodayBookings";
import { Button } from "@/components/ui/Button";

const sampleBookings = [
  {
    id: "demo-booking-1",
    pilotName: "Jan Novák",
    airplaneName: "OK-ABC",
    startLabel: "10:00",
    endLabel: "11:30",
  },
];

export default function DashboardPage() {
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

      <DashboardCards airplanesCount={2} pilotsCount={3} todayBookingsCount={1} />
      <TodayBookings bookings={sampleBookings} />
    </div>
  );
}
