"use client";

import { useMemo, useState } from "react";
import { AirplaneForm, type AirplaneFormValues } from "@/components/airplanes/AirplaneForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

type AirplaneItem = {
  id: string;
  name: string;
  type: string;
};

type AirplanesPageClientProps = {
  airplanes: AirplaneItem[];
};

export function AirplanesPageClient({ airplanes }: AirplanesPageClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingAirplaneId, setEditingAirplaneId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();

  const editingAirplane = useMemo(
    () => airplanes.find((item) => item.id === editingAirplaneId) ?? null,
    [airplanes, editingAirplaneId],
  );

  async function handleCreate(values: AirplaneFormValues) {
    const response = await fetch("/api/airplanes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setErrorMessage(data.message ?? "Nepodařilo se vytvořit letadlo.");
      return;
    }

    setErrorMessage(undefined);
    setShowForm(false);
    router.refresh();
  }

  async function handleUpdate(values: AirplaneFormValues) {
    if (!editingAirplaneId) {
      return;
    }

    const response = await fetch(`/api/airplanes/${editingAirplaneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setErrorMessage(data.message ?? "Nepodařilo se upravit letadlo.");
      return;
    }

    setErrorMessage(undefined);
    setEditingAirplaneId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/airplanes/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setErrorMessage(data.message ?? "Nepodařilo se smazat letadlo.");
      return;
    }

    setErrorMessage(undefined);
    if (editingAirplaneId === id) {
      setEditingAirplaneId(null);
    }
    router.refresh();
  }

  function closeCreateForm() {
    setErrorMessage(undefined);
    setShowForm(false);
  }

  function closeEditForm() {
    setErrorMessage(undefined);
    setEditingAirplaneId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Letadla</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Správa flotily</h2>
          <p className="mt-2 text-slate-600">
            Přehled letadel, která je možné rezervovat v kalendáři.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(undefined);
            setEditingAirplaneId(null);
            setShowForm((value) => !value);
          }}
        >
          {showForm ? "Zavřít formulář" : "Přidat letadlo"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <AirplaneForm onSubmit={handleCreate} onCancel={closeCreateForm} errorMessage={errorMessage} />
        </Card>
      ) : null}

      {editingAirplane ? (
        <Card>
          <AirplaneForm
            initialValues={{ name: editingAirplane.name, type: editingAirplane.type }}
            submitLabel="Uložit změny"
            onSubmit={handleUpdate}
            onCancel={closeEditForm}
            errorMessage={errorMessage}
          />
        </Card>
      ) : null}

      <div className="grid gap-4">
        {airplanes.map((airplane) => (
          <Card key={airplane.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">{airplane.name}</div>
              <div className="text-sm text-slate-500">{airplane.type}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setErrorMessage(undefined);
                  setShowForm(false);
                  setEditingAirplaneId(airplane.id);
                }}
              >
                Upravit
              </Button>
              <Button variant="secondary" onClick={() => handleDelete(airplane.id)}>
                Smazat
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
