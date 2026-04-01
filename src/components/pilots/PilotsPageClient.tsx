"use client";

import { Card } from "@/components/ui/Card";

type PilotItem = {
  id: string;
  name: string;
  email: string | null;
  role: "club_admin" | "pilot";
  status: "active" | "inactive";
  created_at: string;
};

type PilotsPageClientProps = {
  pilots: PilotItem[];
};

export function PilotsPageClient({ pilots }: PilotsPageClientProps) {
  function roleLabel(role: PilotItem["role"]) {
    return role === "club_admin" ? "Klubový admin" : "Pilot";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Piloti</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Účty pro rezervace</h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            Pilot už musí mít účet v aeroklubu. Tenhle seznam se skládá z aktivních členů
            a jejich role spravuješ na stránce Členové, ne ručně mimo klub.
          </p>
        </div>
      </div>

      {pilots.length === 0 ? (
        <Card>
          <p className="text-lg font-semibold text-slate-900">Zatím žádné účty</p>
          <p className="mt-2 text-slate-600">
            Nejdřív pozvi člena přes pozvánkový kód a pak mu v přehledu členů nastav roli pilota nebo admina.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pilots.map((pilot) => (
            <Card key={pilot.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">{pilot.name}</div>
                <div className="text-sm text-slate-500">{pilot.email ?? "Bez e-mailu"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="font-medium text-slate-900">{roleLabel(pilot.role)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
