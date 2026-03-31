"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export type AirplaneFormValues = {
  name: string;
  type: string;
};

type AirplaneFormProps = {
  initialValues?: AirplaneFormValues;
  submitLabel?: string;
  onSubmit: (values: AirplaneFormValues) => Promise<void> | void;
  onCancel: () => void;
  errorMessage?: string;
};

export function AirplaneForm({
  initialValues = { name: "", type: "" },
  submitLabel = "Uložit letadlo",
  onSubmit,
  onCancel,
  errorMessage,
}: AirplaneFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [type, setType] = useState(initialValues.type);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ name, type });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="airplane-name">
          Imatrikulace
        </label>
        <input
          id="airplane-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="airplane-type">
          Typ letadla
        </label>
        <input
          id="airplane-type"
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Zrušit
        </Button>
      </div>
    </form>
  );
}
