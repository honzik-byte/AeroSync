"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export type PilotFormValues = {
  name: string;
  email: string;
};

type PilotFormProps = {
  initialValues?: PilotFormValues;
  submitLabel?: string;
  onSubmit: (values: PilotFormValues) => Promise<void> | void;
  onCancel: () => void;
  errorMessage?: string;
};

export function PilotForm({
  initialValues = { name: "", email: "" },
  submitLabel = "Uložit pilota",
  onSubmit,
  onCancel,
  errorMessage,
}: PilotFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [email, setEmail] = useState(initialValues.email);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ name, email });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pilot-name">
          Jméno pilota
        </label>
        <input
          id="pilot-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pilot-email">
          E-mail
        </label>
        <input
          id="pilot-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
