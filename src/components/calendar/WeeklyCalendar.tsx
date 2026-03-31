import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";

export function WeeklyCalendar() {
  return (
    <div className="space-y-4">
      <CalendarToolbar />
      <CalendarGrid />
    </div>
  );
}
