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
  currentUserRole: "super_admin" | "club_admin" | "pilot" | "anonymous";
  currentUserId: string | null;
  bookings: {
    id: string;
    airplaneId: string;
    pilotId: string;
    start_time: string;
    end_time: string;
  }[];
  date: string;
};

export function WeeklyCalendar({
  airplanes,
  pilots,
  currentUserRole,
  currentUserId,
  bookings,
  date,
}: WeeklyCalendarProps) {
  return (
    <div className="space-y-4">
      <CalendarToolbar date={date} />
      <CalendarGrid
        airplanes={airplanes}
        pilots={pilots}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        bookings={bookings}
        date={date}
      />
    </div>
  );
}
