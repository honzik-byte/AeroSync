import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Kalendář</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">Týdenní rezervace letadel</h2>
        <p className="mt-2 text-slate-600">
          Hlavní pracovní plocha AeroSyncu. Sloty jsou po 15 minutách a každé letadlo má svůj sloupec.
        </p>
      </div>
      <WeeklyCalendar />
    </div>
  );
}
