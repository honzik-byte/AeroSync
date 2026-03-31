"use client";

import { BookingForm, type BookingFormValues } from "@/components/bookings/BookingForm";

type BookingOption = {
  id: string;
  label: string;
};

type BookingModalProps = {
  isOpen: boolean;
  title: string;
  airplaneOptions: BookingOption[];
  pilotOptions: BookingOption[];
  slotOptions: string[];
  initialValues: BookingFormValues;
  submitLabel: string;
  errorMessage?: string;
  onSubmit: (values: BookingFormValues) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function BookingModal({
  isOpen,
  title,
  airplaneOptions,
  pilotOptions,
  slotOptions,
  initialValues,
  submitLabel,
  errorMessage,
  onSubmit,
  onDelete,
  onClose,
}: BookingModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Rezervace</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h3>
        </div>

        <BookingForm
          airplaneOptions={airplaneOptions}
          pilotOptions={pilotOptions}
          slotOptions={slotOptions}
          initialValues={initialValues}
          submitLabel={submitLabel}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onDelete={onDelete}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
