"use client";

import { useState } from "react";
import { PilotForm } from "@/components/pilots/PilotForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const samplePilots = [
  { id: "1", name: "Jan Novák", email: "jan@aerosync.cz" },
  { id: "2", name: "Petr Dvořák", email: null },
];

export function PilotsPageClient() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Piloti</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Správa pilotů</h2>
          <p className="mt-2 text-slate-600">Seznam lidí, kteří mohou vytvářet rezervace letadel.</p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Zavřít formulář" : "Přidat pilota"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <PilotForm onSuccess={() => setShowForm(false)} />
        </Card>
      ) : null}

      <div className="grid gap-4">
        {samplePilots.map((pilot) => (
          <Card key={pilot.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">{pilot.name}</div>
              <div className="text-sm text-slate-500">{pilot.email ?? "Bez e-mailu"}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">Upravit</Button>
              <Button variant="secondary">Smazat</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
