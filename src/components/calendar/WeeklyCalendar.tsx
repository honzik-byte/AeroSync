import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";

type WeeklyCalendarProps = {
  airplanes: {
    id: string;
    name: string;
    type: string;
  }[];
  pilots: {
    id: string;
    name: string;
  }[];
  bookings: {
    id: string;
    airplaneId: string;
    pilotId: string;
    start_time: string;
    end_time: string;
  }[];
  date: string;
};

export function WeeklyCalendar({ airplanes, pilots, bookings, date }: WeeklyCalendarProps) {
  return (
    <div className="space-y-4">
      <CalendarToolbar date={date} />
      <CalendarGrid airplanes={airplanes} pilots={pilots} bookings={bookings} date={date} />
    </div>
  );
}
