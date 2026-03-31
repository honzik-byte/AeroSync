import { buildTimeSlots } from "@/lib/dates";

const airplanes = [
  { id: "1", name: "OK-ABC", type: "Cessna 172" },
  { id: "2", name: "OK-XYZ", type: "Piper PA-28" },
];

const sampleBookings = [
  {
    id: "b1",
    airplaneId: "1",
    start: "10:00",
    end: "11:30",
    pilotName: "Jan Novák",
  },
];

const slots = buildTimeSlots(8, 18);

export function CalendarGrid() {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div
        className="grid min-w-[900px]"
        style={{ gridTemplateColumns: `120px repeat(${airplanes.length}, minmax(260px, 1fr))` }}
      >
        <div className="border-b border-r border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
          Čas
        </div>
        {airplanes.map((airplane) => (
          <div
            key={airplane.id}
            className="border-b border-r border-slate-200 bg-slate-50 p-4 last:border-r-0"
          >
            <div className="font-semibold text-slate-900">{airplane.name}</div>
            <div className="text-sm text-slate-500">{airplane.type}</div>
          </div>
        ))}

        {slots.map((slot) => (
          <>
            <div
              key={`time-${slot}`}
              className="border-r border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            >
              {slot}
            </div>
            {airplanes.map((airplane) => {
              const booking = sampleBookings.find(
                (item) => item.airplaneId === airplane.id && item.start === slot,
              );

              return (
                <div
                  key={`${airplane.id}-${slot}`}
                  className="min-h-16 border-r border-t border-slate-200 p-2 last:border-r-0"
                >
                  {booking ? (
                    <div className="rounded-2xl bg-sky-100 p-3 text-sm text-sky-900 shadow-sm">
                      <div className="font-semibold">{booking.pilotName}</div>
                      <div className="mt-1 text-xs">
                        {booking.start}–{booking.end}
                      </div>
                    </div>
                  ) : (
                    <button className="h-full min-h-12 w-full rounded-2xl border border-dashed border-transparent text-left text-xs text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-500">
                      Volný slot
                    </button>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
