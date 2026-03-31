"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AeroclubForm, type AeroclubFormValues } from "@/components/admin/AeroclubForm";

type AeroclubItem = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type AeroclubsPageClientProps = {
  aeroclubs: AeroclubItem[];
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

export function AeroclubsPageClient({ aeroclubs }: AeroclubsPageClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingAeroclubId, setEditingAeroclubId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();

  const editingAeroclub = useMemo(
    () => aeroclubs.find((item) => item.id === editingAeroclubId) ?? null,
    [aeroclubs, editingAeroclubId],
  );

  async function handleCreate(values: AeroclubFormValues) {
    try {
      const response = await fetch("/api/admin/aeroclubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        setErrorMessage(
          await readResponseMessage(response, "Nepodařilo se vytvořit aeroklub. Zkus to prosím znovu."),
        );
        return;
      }

      setErrorMessage(undefined);
      setShowForm(false);
      router.refresh();
    } catch {
      setErrorMessage("Nepodařilo se vytvořit aeroklub. Zkus to prosím znovu.");
    }
  }

  async function handleUpdate(values: AeroclubFormValues) {
    if (!editingAeroclubId) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/aeroclubs/${editingAeroclubId}`, {
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
      setEditingAeroclubId(null);
      router.refresh();
    } catch {
      setErrorMessage("Nepodařilo se upravit aeroklub. Zkus to prosím znovu.");
    }
  }

  function closeCreateForm() {
    setErrorMessage(undefined);
    setShowForm(false);
  }

  function closeEditForm() {
    setErrorMessage(undefined);
    setEditingAeroclubId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
            Super admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Správa aeroklubů</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Přidávej a upravuj aerokluby, které pak mohou používat další části AeroSyncu.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(undefined);
            setEditingAeroclubId(null);
            setShowForm((value) => !value);
          }}
        >
          {showForm ? "Zavřít formulář" : "Přidat aeroklub"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <AeroclubForm
            onSubmit={handleCreate}
            onCancel={closeCreateForm}
            errorMessage={errorMessage}
          />
        </Card>
      ) : null}

      {editingAeroclub ? (
        <Card>
          <AeroclubForm
            initialValues={{ name: editingAeroclub.name, slug: editingAeroclub.slug }}
            submitLabel="Uložit změny"
            onSubmit={handleUpdate}
            onCancel={closeEditForm}
            errorMessage={errorMessage}
          />
        </Card>
      ) : null}

      <div className="grid gap-4">
        {aeroclubs.map((aeroclub) => (
          <Card
            key={aeroclub.id}
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="text-lg font-semibold text-slate-900">{aeroclub.name}</div>
              <div className="text-sm text-slate-500">Slug: {aeroclub.slug}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                Vytvořeno {formatDate(aeroclub.created_at)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/aeroclubs/${aeroclub.id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Detail
              </Link>
              <Button
                variant="secondary"
                onClick={() => {
                  setErrorMessage(undefined);
                  setShowForm(false);
                  setEditingAeroclubId(aeroclub.id);
                }}
              >
                Upravit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
