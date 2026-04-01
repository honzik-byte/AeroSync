"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type CalendarToolbarProps = {
  date: string;
};

function addDays(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

function getWeekRangeLabel(date: string) {
  const value = new Date(`${date}T12:00:00.000Z`);
  const dayOfWeek = (value.getUTCDay() + 6) % 7;
  const start = new Date(value);
  start.setUTCDate(value.getUTCDate() - dayOfWeek);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  const formatter = new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function CalendarToolbar({ date }: CalendarToolbarProps) {
  const router = useRouter();

  function navigateToDate(nextDate: string) {
    router.push(`/calendar?date=${nextDate}`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Vybraný den</p>
          <input
            type="date"
            value={date}
            onChange={(event) => navigateToDate(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 md:w-auto"
          />
        </div>
        <p className="text-sm font-medium text-slate-500">Týdenní pohled</p>
        <h2 className="text-xl font-semibold text-slate-900">{getWeekRangeLabel(date)}</h2>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => navigateToDate(addDays(date, -7))}>
          Předchozí týden
        </Button>
        <Button variant="secondary" onClick={() => navigateToDate(addDays(date, 7))}>
          Další týden
        </Button>
      </div>
    </div>
  );
}
