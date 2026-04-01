"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export type BookingFormValues = {
  airplaneId: string;
  pilotId: string;
  startSlot: string;
  endSlot: string;
};

type BookingOption = {
  id: string;
  label: string;
};

type BookingFormProps = {
  dateLabel?: string;
  airplaneOptions: BookingOption[];
  pilotOptions: BookingOption[];
  slotOptions: string[];
  initialValues: BookingFormValues;
  errorMessage?: string;
  submitLabel: string;
  onSubmit: (values: BookingFormValues) => void;
  onDelete?: () => void;
  onCancel: () => void;
};

export function BookingForm({
  dateLabel,
  airplaneOptions,
  pilotOptions,
  slotOptions,
  initialValues,
  errorMessage,
  submitLabel,
  onSubmit,
  onDelete,
  onCancel,
}: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function updateField<Key extends keyof BookingFormValues>(key: Key, value: BookingFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      {dateLabel ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="booking-date">
            Den rezervace
          </label>
          <input
            id="booking-date"
            value={dateLabel}
            readOnly
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-700"
          />
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="booking-airplane">
          Letadlo
        </label>
        <select
          id="booking-airplane"
          value={values.airplaneId}
          onChange={(event) => updateField("airplaneId", event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5"
        >
          {airplaneOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="booking-pilot">
          Pilot
        </label>
        <select
          id="booking-pilot"
          value={values.pilotId}
          onChange={(event) => updateField("pilotId", event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5"
        >
          {pilotOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="booking-start">
            Začátek
          </label>
          <select
            id="booking-start"
            value={values.startSlot}
            onChange={(event) => updateField("startSlot", event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-3 py-2.5"
          >
            {slotOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="booking-end">
            Konec
          </label>
          <select
            id="booking-end"
            value={values.endSlot}
            onChange={(event) => updateField("endSlot", event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-3 py-2.5"
          >
            {slotOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <div className="flex gap-2">
          <Button type="submit">{submitLabel}</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Zrušit
          </Button>
        </div>
        {onDelete ? (
          <Button type="button" variant="secondary" onClick={onDelete}>
            Smazat rezervaci
          </Button>
        ) : null}
      </div>
    </form>
  );
}
