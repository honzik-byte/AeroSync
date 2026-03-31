import { Card } from "@/components/ui/Card";

type TodayBooking = {
  id: string;
  pilotName: string;
  airplaneName: string;
  startLabel: string;
  endLabel: string;
};

type TodayBookingsProps = {
  bookings: TodayBooking[];
};

export function TodayBookings({ bookings }: TodayBookingsProps) {
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Dnešní rezervace</h2>
        <p className="text-sm text-slate-500">Rychlý přehled dnešního provozu.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
          Na dnešek zatím není žádná rezervace.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="font-medium text-slate-900">{booking.pilotName}</div>
              <div className="mt-1 text-sm text-slate-600">
                {booking.airplaneName} • {booking.startLabel}–{booking.endLabel}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
