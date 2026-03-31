"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export type AeroclubFormValues = {
  name: string;
  slug: string;
};

type AeroclubFormProps = {
  initialValues?: AeroclubFormValues;
  submitLabel?: string;
  onSubmit: (values: AeroclubFormValues) => Promise<void> | void;
  onCancel: () => void;
  errorMessage?: string;
};

export function AeroclubForm({
  initialValues = { name: "", slug: "" },
  submitLabel = "Uložit klub",
  onSubmit,
  onCancel,
  errorMessage,
}: AeroclubFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [slug, setSlug] = useState(initialValues.slug);

  useEffect(() => {
    setName(initialValues.name);
    setSlug(initialValues.slug);
  }, [initialValues.name, initialValues.slug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ name, slug });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="aeroclub-name">
          Název klubu
        </label>
        <input
          id="aeroclub-name"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="aeroclub-slug">
          Slug klubu
        </label>
        <input
          id="aeroclub-slug"
          name="slug"
          required
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 outline-none ring-0 transition focus:border-sky-400"
        />
        <p className="mt-1 text-xs text-slate-500">Použij malá písmena, čísla a pomlčky.</p>
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
