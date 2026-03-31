"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type PendingBooking = {
  id: string;
  airplaneName: string;
  airplaneType: string;
  pilotName: string;
  requestedByName: string;
  start_time: string;
  end_time: string;
  rejectionReason: string | null;
  createdAt: string;
};

type PendingBookingsClientProps = {
  bookings: PendingBooking[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(new Date(value));
}

export function PendingBookingsClient({ bookings }: PendingBookingsClientProps) {
  const router = useRouter();
  const [busyBookingId, setBusyBookingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  async function mutateBooking(
    bookingId: string,
    endpoint: "approve" | "reject",
    rejectionReason?: string,
  ) {
    setBusyBookingId(bookingId);
    setErrorMessage(undefined);

    try {
      const requestInit: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };

      if (endpoint === "reject") {
        requestInit.body = JSON.stringify({
          rejection_reason: rejectionReason?.trim() ?? "",
        });
      }

      const response = await fetch(`/api/bookings/${bookingId}/${endpoint}`, requestInit);

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "Nepodařilo se upravit rezervaci.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nepodařilo se upravit rezervaci.");
    } finally {
      setBusyBookingId(null);
    }
  }

  if (bookings.length === 0) {
    return (
      <Card className="border-dashed border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-900">Žádné čekající rezervace</h2>
        <p className="mt-2 text-slate-600">Všechno je aktuálně schválené nebo zamítnuté.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {bookings.map((booking) => (
        <Card key={booking.id} className="space-y-4 border-slate-200 bg-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-600">Čeká na schválení</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                {booking.airplaneName}
                {booking.airplaneType ? ` • ${booking.airplaneType}` : ""}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {booking.pilotName} • {formatDateTime(booking.start_time)} – {formatDateTime(booking.end_time)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Žádost vytvořil {booking.requestedByName} • {formatDateTime(booking.createdAt)}
              </p>
              {booking.rejectionReason ? (
                <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  Dřívější důvod zamítnutí: {booking.rejectionReason}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={busyBookingId === booking.id}
                onClick={() => mutateBooking(booking.id, "approve")}
              >
                Schválit
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busyBookingId === booking.id}
                onClick={() =>
                  mutateBooking(booking.id, "reject", rejectionReasons[booking.id] ?? "")
                }
              >
                Zamítnout
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`rejection-${booking.id}`}>
              Důvod zamítnutí
            </label>
            <textarea
              id={`rejection-${booking.id}`}
              value={rejectionReasons[booking.id] ?? ""}
              onChange={(event) =>
                setRejectionReasons((current) => ({
                  ...current,
                  [booking.id]: event.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5"
              placeholder="Např. letadlo je potřeba pro výcvik, prosím vyber jiný čas."
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
