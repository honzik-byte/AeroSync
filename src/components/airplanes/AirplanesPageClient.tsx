"use client";

import { useState } from "react";
import { AirplaneForm } from "@/components/airplanes/AirplaneForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const sampleAirplanes = [
  { id: "1", name: "OK-ABC", type: "Cessna 172" },
  { id: "2", name: "OK-XYZ", type: "Piper PA-28" },
];

export function AirplanesPageClient() {
  const [showForm, setShowForm] = useState(false);

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
        <Button onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Zavřít formulář" : "Přidat letadlo"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <AirplaneForm onSuccess={() => setShowForm(false)} />
        </Card>
      ) : null}

      <div className="grid gap-4">
        {sampleAirplanes.map((airplane) => (
          <Card key={airplane.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">{airplane.name}</div>
              <div className="text-sm text-slate-500">{airplane.type}</div>
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
