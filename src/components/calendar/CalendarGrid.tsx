"use client";

import { BookingModal } from "@/components/bookings/BookingModal";
import { buildTimeSlots } from "@/lib/dates";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CalendarBooking = {
  id: string;
  airplaneId: string;
  pilotId: string;
  start_time: string;
  end_time: string;
};

type AirplaneOption = {
  id: string;
  name: string;
  type: string;
};

type PilotOption = {
  id: string;
  name: string;
};

type CalendarGridProps = {
  airplanes: AirplaneOption[];
  pilots: PilotOption[];
  bookings: CalendarBooking[];
  date: string;
};

type SlotBooking = CalendarBooking & {
  start: string;
  end: string;
};

const slotOptions = buildTimeSlots(8, 18);

function formatSlotFromIso(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Prague",
  }).format(new Date(value));
}

export function CalendarGrid({ airplanes, pilots, bookings, date }: CalendarGridProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState({
    airplaneId: airplanes[0]?.id ?? "",
    pilotId: pilots[0]?.id ?? "",
    startSlot: slotOptions[0] ?? "",
    endSlot: slotOptions[1] ?? "",
  });

  const airplaneOptions = airplanes.map((airplane) => ({
    id: airplane.id,
    label: `${airplane.name} • ${airplane.type}`,
  }));

  const pilotOptions = pilots.map((pilot) => ({
    id: pilot.id,
    label: pilot.name,
  }));

  const bookingsWithSlots = useMemo<SlotBooking[]>(() => {
    return bookings.map((booking) => ({
      ...booking,
      start: formatSlotFromIso(booking.start_time),
      end: formatSlotFromIso(booking.end_time),
    }));
  }, [bookings]);

  const bookingMap = useMemo(() => {
    return new Map(
      bookingsWithSlots.map((booking) => [`${booking.airplaneId}-${booking.start}`, booking] as const),
    );
  }, [bookingsWithSlots]);

  function toIso(slot: string) {
    return `${date}T${slot}:00.000+02:00`;
  }

  function openCreateModal(airplaneId: string, startSlot: string) {
    const currentIndex = slotOptions.indexOf(startSlot);
    const fallbackEnd = slotOptions[Math.min(currentIndex + 1, slotOptions.length - 1)] ?? startSlot;

    setErrorMessage(undefined);
    setEditingBookingId(null);
    setDraftValues({
      airplaneId,
      pilotId: pilots[0]?.id ?? "",
      startSlot,
      endSlot: fallbackEnd,
    });
    setIsModalOpen(true);
  }

  function openEditModal(booking: SlotBooking) {
    setErrorMessage(undefined);
    setEditingBookingId(booking.id);
    setDraftValues({
      airplaneId: booking.airplaneId,
      pilotId: booking.pilotId,
      startSlot: booking.start,
      endSlot: booking.end,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setErrorMessage(undefined);
    setEditingBookingId(null);
    setIsModalOpen(false);
  }

  function handleSubmit(values: {
    airplaneId: string;
    pilotId: string;
    startSlot: string;
    endSlot: string;
  }) {
    const payload = {
      airplane_id: values.airplaneId,
      pilot_id: values.pilotId,
      start_time: toIso(values.startSlot),
      end_time: toIso(values.endSlot),
    };

    const url = editingBookingId ? `/api/bookings/${editingBookingId}` : "/api/bookings";
    const method = editingBookingId ? "PATCH" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = (await response.json()) as { message?: string };
          throw new Error(data.message ?? "Nepodařilo se uložit rezervaci.");
        }

        closeModal();
        router.refresh();
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "Nepodařilo se uložit rezervaci.");
      });
  }

  function handleDelete() {
    if (!editingBookingId) {
      return;
    }

    fetch(`/api/bookings/${editingBookingId}`, { method: "DELETE" })
      .then(async (response) => {
        if (!response.ok) {
          const data = (await response.json()) as { message?: string };
          throw new Error(data.message ?? "Nepodařilo se smazat rezervaci.");
        }

        closeModal();
        router.refresh();
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "Nepodařilo se smazat rezervaci.");
      });
  }

  return (
    <>
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

          {slotOptions.map((slot) => (
            <div
              key={`row-${slot}`}
              className="contents"
            >
              <div className="border-r border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                {slot}
              </div>
              {airplanes.map((airplane) => {
                const booking = bookingMap.get(`${airplane.id}-${slot}`);
                const pilot = booking ? pilots.find((item) => item.id === booking.pilotId) : null;

                return (
                  <div
                    key={`${airplane.id}-${slot}`}
                    className="min-h-16 border-r border-t border-slate-200 p-2 last:border-r-0"
                  >
                    {booking ? (
                      <button
                        className="w-full rounded-2xl bg-sky-100 p-3 text-left text-sm text-sky-900 shadow-sm transition hover:bg-sky-200"
                        onClick={() => openEditModal(booking)}
                      >
                        <div className="font-semibold">{pilot?.name ?? "Neznámý pilot"}</div>
                        <div className="mt-1 text-xs">
                          {booking.start}–{booking.end}
                        </div>
                      </button>
                    ) : (
                      <button
                        className="h-full min-h-12 w-full rounded-2xl border border-dashed border-transparent text-left text-xs text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-500"
                        onClick={() => openCreateModal(airplane.id, slot)}
                      >
                        Volný slot
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        title={editingBookingId ? "Upravit rezervaci" : "Nová rezervace"}
        airplaneOptions={airplaneOptions}
        pilotOptions={pilotOptions}
        slotOptions={slotOptions}
        initialValues={draftValues}
        submitLabel={editingBookingId ? "Uložit změny" : "Vytvořit rezervaci"}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onDelete={editingBookingId ? handleDelete : undefined}
        onClose={closeModal}
      />
    </>
  );
}
