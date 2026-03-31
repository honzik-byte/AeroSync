"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type AirplaneFormProps = {
  onSuccess: () => void;
};

export function AirplaneForm({ onSuccess }: AirplaneFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSuccess();
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

      <Button type="submit">Uložit letadlo</Button>
    </form>
  );
}
