"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AeroclubForm, type AeroclubFormValues } from "@/components/admin/AeroclubForm";

type AeroclubDetail = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type AeroclubDetailClientProps = {
  aeroclub: AeroclubDetail;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(new Date(value));
}

async function readResponseMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: unknown };

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ne-JSON odpověď nebo neplatné tělo.
  }

  return fallbackMessage;
}

export function AeroclubDetailClient({ aeroclub }: AeroclubDetailClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  async function handleUpdate(values: AeroclubFormValues) {
    try {
      const response = await fetch(`/api/admin/aeroclubs/${aeroclub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        setErrorMessage(
          await readResponseMessage(response, "Nepodařilo se upravit aeroklub. Zkus to prosím znovu."),
        );
        return;
      }

      setErrorMessage(undefined);
      setShowForm(false);
      router.refresh();
    } catch {
      setErrorMessage("Nepodařilo se upravit aeroklub. Zkus to prosím znovu.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
            Detail aeroklubu
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{aeroclub.name}</h1>
          <p className="mt-2 text-slate-600">Základní údaje a rychlá úprava klubu.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/aeroclubs"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Zpět na seznam
          </Link>
          <Button
            onClick={() => {
              setErrorMessage(undefined);
              setShowForm((value) => !value);
            }}
          >
            {showForm ? "Zavřít formulář" : "Upravit klub"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Název</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{aeroclub.name}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Slug</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{aeroclub.slug}</p>
        </Card>
        <Card className="md:col-span-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Vytvořeno
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{formatDate(aeroclub.created_at)}</p>
        </Card>
      </div>

      {showForm ? (
        <Card>
          <AeroclubForm
            initialValues={{ name: aeroclub.name, slug: aeroclub.slug }}
            submitLabel="Uložit změny"
            onSubmit={handleUpdate}
            onCancel={() => {
              setErrorMessage(undefined);
              setShowForm(false);
            }}
            errorMessage={errorMessage}
          />
        </Card>
      ) : null}
    </div>
  );
}
