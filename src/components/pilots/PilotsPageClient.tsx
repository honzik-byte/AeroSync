"use client";

import { useMemo, useState } from "react";
import { PilotForm, type PilotFormValues } from "@/components/pilots/PilotForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

type PilotItem = {
  id: string;
  name: string;
  email: string | null;
};

type PilotsPageClientProps = {
  pilots: PilotItem[];
};

export function PilotsPageClient({ pilots }: PilotsPageClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingPilotId, setEditingPilotId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();

  const editingPilot = useMemo(
    () => pilots.find((item) => item.id === editingPilotId) ?? null,
    [pilots, editingPilotId],
  );

  async function handleCreate(values: PilotFormValues) {
    const response = await fetch("/api/pilots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setErrorMessage(data.message ?? "Nepodařilo se vytvořit pilota.");
      return;
    }

    setErrorMessage(undefined);
    setShowForm(false);
    router.refresh();
  }

  async function handleUpdate(values: PilotFormValues) {
    if (!editingPilotId) {
      return;
    }

    const response = await fetch(`/api/pilots/${editingPilotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setErrorMessage(data.message ?? "Nepodařilo se upravit pilota.");
      return;
    }

    setErrorMessage(undefined);
    setEditingPilotId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/pilots/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setErrorMessage(data.message ?? "Nepodařilo se smazat pilota.");
      return;
    }

    setErrorMessage(undefined);
    if (editingPilotId === id) {
      setEditingPilotId(null);
    }
    router.refresh();
  }

  function closeCreateForm() {
    setErrorMessage(undefined);
    setShowForm(false);
  }

  function closeEditForm() {
    setErrorMessage(undefined);
    setEditingPilotId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Piloti</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Správa pilotů</h2>
          <p className="mt-2 text-slate-600">Seznam lidí, kteří mohou vytvářet rezervace letadel.</p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(undefined);
            setEditingPilotId(null);
            setShowForm((value) => !value);
          }}
        >
          {showForm ? "Zavřít formulář" : "Přidat pilota"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <PilotForm onSubmit={handleCreate} onCancel={closeCreateForm} errorMessage={errorMessage} />
        </Card>
      ) : null}

      {editingPilot ? (
        <Card>
          <PilotForm
            initialValues={{ name: editingPilot.name, email: editingPilot.email ?? "" }}
            submitLabel="Uložit změny"
            onSubmit={handleUpdate}
            onCancel={closeEditForm}
            errorMessage={errorMessage}
          />
        </Card>
      ) : null}

      <div className="grid gap-4">
        {pilots.map((pilot) => (
          <Card key={pilot.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">{pilot.name}</div>
              <div className="text-sm text-slate-500">{pilot.email ?? "Bez e-mailu"}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setErrorMessage(undefined);
                  setShowForm(false);
                  setEditingPilotId(pilot.id);
                }}
              >
                Upravit
              </Button>
              <Button variant="secondary" onClick={() => handleDelete(pilot.id)}>
                Smazat
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
