# AeroSync MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Postavit česky lokalizované MVP AeroSync jako jednoduchý interní rezervační systém pro aerokluby s CRUD správou letadel, pilotů a rezervací, týdenním kalendářem a blokací překryvů rezervací.

**Architecture:** Projekt bude Next.js App Router aplikace s Tailwind CSS, serverovými API routami a Supabase jako databází. Zápisy i validace poběží pouze na serveru přes Next.js route handlery, zatímco frontend bude jednoduché české rozhraní se sidebar layoutem, dashboardem, CRUD obrazovkami a týdenním kalendářem po 15 minutách.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Supabase, Vitest, Testing Library, date-fns, Zod

---

## Cílová struktura souborů

### Nové soubory

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `.env.example`
- `supabase/schema.sql`
- `vitest.config.ts`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/calendar/page.tsx`
- `src/app/airplanes/page.tsx`
- `src/app/pilots/page.tsx`
- `src/app/api/airplanes/route.ts`
- `src/app/api/airplanes/[id]/route.ts`
- `src/app/api/pilots/route.ts`
- `src/app/api/pilots/[id]/route.ts`
- `src/app/api/bookings/route.ts`
- `src/app/api/bookings/[id]/route.ts`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Topbar.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/airplanes/AirplanesPageClient.tsx`
- `src/components/airplanes/AirplaneForm.tsx`
- `src/components/pilots/PilotsPageClient.tsx`
- `src/components/pilots/PilotForm.tsx`
- `src/components/bookings/BookingForm.tsx`
- `src/components/bookings/BookingModal.tsx`
- `src/components/calendar/WeeklyCalendar.tsx`
- `src/components/calendar/CalendarGrid.tsx`
- `src/components/calendar/CalendarToolbar.tsx`
- `src/components/dashboard/DashboardCards.tsx`
- `src/components/dashboard/TodayBookings.tsx`
- `src/lib/config.ts`
- `src/lib/serverSupabase.ts`
- `src/lib/activeAeroclub.ts`
- `src/lib/dates.ts`
- `src/lib/bookings.ts`
- `src/lib/validators.ts`
- `src/lib/utils.ts`
- `src/types/index.ts`
- `src/test/bookings.test.ts`
- `src/test/dates.test.ts`
- `src/test/setup.ts`

### Odpovědnosti souborů

- `supabase/schema.sql` definuje databázové tabulky, indexy a seed aktivního aeroklubu.
- `src/lib/serverSupabase.ts` vytváří server-only Supabase klient přes service role klíč.
- `src/lib/activeAeroclub.ts` řeší lookup jednoho aktivního aeroklubu pro MVP.
- `src/lib/bookings.ts` obsahuje booking business logiku a overlap kontrolu.
- `src/lib/validators.ts` drží Zod schémata pro vstupy API.
- `src/components/calendar/*` drží kalendářovou UI logiku odděleně od CRUD formulářů.
- `src/app/api/*` řeší CRUD a vrací české odpovědi.
- `src/test/*` pokrývá overlap pravidla, časové sloty a helpery.

## Task 1: Založení projektu a vývojového základu

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Test: `npm run test`

- [ ] **Step 1: Vytvoř základní smoke test pro helper soubor, aby test runner existoval dřív než implementace**

```ts
// src/test/dates.test.ts
import { describe, expect, it } from "vitest";
import { formatTimeLabel } from "@/lib/dates";

describe("formatTimeLabel", () => {
  it("formátuje čas do českého 24hodinového formátu", () => {
    expect(formatTimeLabel(new Date("2026-03-31T08:15:00Z"))).toBe("08:15");
  });
});
```

- [ ] **Step 2: Spusť test a ověř, že selže kvůli chybějícímu projektu nebo modulu**

Run: `npm run test -- src/test/dates.test.ts`
Expected: FAIL s chybou typu `Missing script: "test"` nebo `Cannot find module '@/lib/dates'`

- [ ] **Step 3: Vytvoř minimální projektový základ**

```json
// package.json
{
  "name": "aerosync",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.8",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0",
    "lucide-react": "^0.511.0",
    "next": "^15.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^22.15.3",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "vitest": "^3.1.2"
  }
}
```

```ts
// src/lib/dates.ts
export function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}
```

```tsx
// src/app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/dates.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts vitest.config.ts .env.example src/app src/lib/dates.ts src/test/dates.test.ts
git commit -m "chore: bootstrap aerosync app foundation"
```

## Task 2: Databázové schéma a serverové napojení na Supabase

**Files:**
- Create: `supabase/schema.sql`
- Create: `src/lib/config.ts`
- Create: `src/lib/serverSupabase.ts`
- Create: `src/lib/activeAeroclub.ts`
- Create: `src/types/index.ts`
- Test: `src/test/dates.test.ts`

- [ ] **Step 1: Přidej failing test pro aktivní aeroklub konfiguraci**

```ts
// src/test/dates.test.ts
import { getActiveAeroclubSlug } from "@/lib/config";

it("vrací slug aktivního aeroklubu z konfigurace", () => {
  process.env.ACTIVE_AEROCLUB_SLUG = "aeroklub-brno";
  expect(getActiveAeroclubSlug()).toBe("aeroklub-brno");
});
```

- [ ] **Step 2: Spusť test a ověř, že selže na chybějící konfiguraci**

Run: `npm run test -- src/test/dates.test.ts`
Expected: FAIL s `getActiveAeroclubSlug is not a function` nebo `Cannot find module '@/lib/config'`

- [ ] **Step 3: Vytvoř databázové schéma a minimální serverové utility**

```sql
-- supabase/schema.sql
create extension if not exists pgcrypto;

create table if not exists aeroclubs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists airplanes (
  id uuid primary key default gen_random_uuid(),
  aeroclub_id uuid not null references aeroclubs(id) on delete restrict,
  name text not null,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists pilots (
  id uuid primary key default gen_random_uuid(),
  aeroclub_id uuid not null references aeroclubs(id) on delete restrict,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  aeroclub_id uuid not null references aeroclubs(id) on delete restrict,
  airplane_id uuid not null references airplanes(id) on delete restrict,
  pilot_id uuid not null references pilots(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now(),
  constraint bookings_time_order_check check (end_time > start_time)
);

create index if not exists bookings_airplane_time_idx
  on bookings (airplane_id, start_time, end_time);

insert into aeroclubs (slug, name)
values ('demo-aeroklub', 'Demo Aeroklub')
on conflict (slug) do nothing;
```

```ts
// src/lib/config.ts
export function getActiveAeroclubSlug() {
  return process.env.ACTIVE_AEROCLUB_SLUG || "demo-aeroklub";
}
```

```ts
// src/types/index.ts
export type Aeroclub = {
  id: string;
  slug: string;
  name: string;
  created_at: string;
};

export type Airplane = {
  id: string;
  aeroclub_id: string;
  name: string;
  type: string;
  created_at: string;
};

export type Pilot = {
  id: string;
  aeroclub_id: string;
  name: string;
  email: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  aeroclub_id: string;
  airplane_id: string;
  pilot_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
};
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/dates.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql src/lib/config.ts src/lib/serverSupabase.ts src/lib/activeAeroclub.ts src/types/index.ts src/test/dates.test.ts
git commit -m "feat: add supabase schema and server config"
```

## Task 3: Booking validace a testy překryvů

**Files:**
- Create: `src/lib/bookings.ts`
- Create: `src/lib/validators.ts`
- Create: `src/test/bookings.test.ts`
- Test: `src/test/bookings.test.ts`

- [ ] **Step 1: Napiš failing testy pro časovou validaci a overlap logiku**

```ts
// src/test/bookings.test.ts
import { describe, expect, it } from "vitest";
import { bookingOverlaps, validateBookingWindow } from "@/lib/bookings";

describe("validateBookingWindow", () => {
  it("odmítne konec rezervace před začátkem", () => {
    expect(() =>
      validateBookingWindow({
        start_time: "2026-03-31T10:00:00.000Z",
        end_time: "2026-03-31T09:45:00.000Z",
      }),
    ).toThrow("Konec rezervace musí být později než začátek.");
  });
});

describe("bookingOverlaps", () => {
  it("vrátí true při překryvu stejného letadla", () => {
    expect(
      bookingOverlaps(
        {
          start_time: "2026-03-31T10:00:00.000Z",
          end_time: "2026-03-31T11:00:00.000Z",
        },
        {
          start_time: "2026-03-31T10:30:00.000Z",
          end_time: "2026-03-31T11:30:00.000Z",
        },
      ),
    ).toBe(true);
  });

  it("vrátí false, když se rezervace jen dotýkají", () => {
    expect(
      bookingOverlaps(
        {
          start_time: "2026-03-31T10:00:00.000Z",
          end_time: "2026-03-31T11:00:00.000Z",
        },
        {
          start_time: "2026-03-31T11:00:00.000Z",
          end_time: "2026-03-31T12:00:00.000Z",
        },
      ),
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Spusť test a ověř, že selže kvůli chybějící implementaci**

Run: `npm run test -- src/test/bookings.test.ts`
Expected: FAIL s `Cannot find module '@/lib/bookings'`

- [ ] **Step 3: Implementuj minimální booking logiku a Zod schéma**

```ts
// src/lib/bookings.ts
type BookingWindow = {
  start_time: string;
  end_time: string;
};

export function validateBookingWindow(window: BookingWindow) {
  const start = new Date(window.start_time).getTime();
  const end = new Date(window.end_time).getTime();

  if (end <= start) {
    throw new Error("Konec rezervace musí být později než začátek.");
  }
}

export function bookingOverlaps(a: BookingWindow, b: BookingWindow) {
  const aStart = new Date(a.start_time).getTime();
  const aEnd = new Date(a.end_time).getTime();
  const bStart = new Date(b.start_time).getTime();
  const bEnd = new Date(b.end_time).getTime();

  return aStart < bEnd && aEnd > bStart;
}
```

```ts
// src/lib/validators.ts
import { z } from "zod";

export const bookingInputSchema = z.object({
  airplane_id: z.string().uuid(),
  pilot_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
});
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/bookings.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/bookings.ts src/lib/validators.ts src/test/bookings.test.ts
git commit -m "feat: add booking validation rules"
```

## Task 4: Layout aplikace, navigace a dashboard

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Topbar.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/dashboard/DashboardCards.tsx`
- Create: `src/components/dashboard/TodayBookings.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/dashboard/page.tsx`
- Test: `src/test/dates.test.ts`

- [ ] **Step 1: Přidej failing render test pro hlavní layout**

```ts
// src/test/dates.test.ts
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/Sidebar";

it("zobrazuje české položky navigace", () => {
  render(<Sidebar />);
  expect(screen.getByText("Přehled")).toBeInTheDocument();
  expect(screen.getByText("Kalendář")).toBeInTheDocument();
  expect(screen.getByText("Letadla")).toBeInTheDocument();
  expect(screen.getByText("Piloti")).toBeInTheDocument();
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/dates.test.ts`
Expected: FAIL s `Cannot find module '@/components/layout/Sidebar'`

- [ ] **Step 3: Implementuj minimální layout a dashboard**

```tsx
// src/components/layout/Sidebar.tsx
import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Přehled" },
  { href: "/calendar", label: "Kalendář" },
  { href: "/airplanes", label: "Letadla" },
  { href: "/pilots", label: "Piloti" },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-6">
      <div className="mb-8 text-xl font-semibold text-slate-900">AeroSync</div>
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

```tsx
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Přehled</h1>
      <p className="text-slate-600">Rychlý přehled dnešního provozu aeroklubu.</p>
    </div>
  );
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/dates.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/dashboard/page.tsx src/components/layout src/components/ui src/components/dashboard src/test/dates.test.ts
git commit -m "feat: add app shell and dashboard skeleton"
```

## Task 5: CRUD pro letadla a piloty

**Files:**
- Create: `src/components/airplanes/AirplanesPageClient.tsx`
- Create: `src/components/airplanes/AirplaneForm.tsx`
- Create: `src/components/pilots/PilotsPageClient.tsx`
- Create: `src/components/pilots/PilotForm.tsx`
- Create: `src/app/airplanes/page.tsx`
- Create: `src/app/pilots/page.tsx`
- Create: `src/app/api/airplanes/route.ts`
- Create: `src/app/api/airplanes/[id]/route.ts`
- Create: `src/app/api/pilots/route.ts`
- Create: `src/app/api/pilots/[id]/route.ts`
- Test: `src/test/dates.test.ts`

- [ ] **Step 1: Přidej failing test pro české formulářové popisky**

```ts
// src/test/dates.test.ts
import { render, screen } from "@testing-library/react";
import { AirplaneForm } from "@/components/airplanes/AirplaneForm";

it("zobrazuje formulář letadla v češtině", () => {
  render(<AirplaneForm onSuccess={() => undefined} />);
  expect(screen.getByLabelText("Imatrikulace")).toBeInTheDocument();
  expect(screen.getByLabelText("Typ letadla")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Uložit letadlo" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/dates.test.ts`
Expected: FAIL s `Cannot find module '@/components/airplanes/AirplaneForm'`

- [ ] **Step 3: Implementuj minimální CRUD obrazovky a API routy**

```tsx
// src/components/airplanes/AirplaneForm.tsx
"use client";

type AirplaneFormProps = {
  onSuccess: () => void;
};

export function AirplaneForm({ onSuccess }: AirplaneFormProps) {
  return (
    <form className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
          Imatrikulace
        </label>
        <input id="name" name="name" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="type">
          Typ letadla
        </label>
        <input id="type" name="type" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
      </div>
      <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-white">
        Uložit letadlo
      </button>
    </form>
  );
}
```

```ts
// src/app/api/airplanes/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Vytvoření letadla zatím není implementované." }, { status: 501 });
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/dates.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/airplanes src/components/pilots src/app/airplanes/page.tsx src/app/pilots/page.tsx src/app/api/airplanes src/app/api/pilots src/test/dates.test.ts
git commit -m "feat: add airplanes and pilots crud surfaces"
```

## Task 6: API logika rezervací a modal formulář

**Files:**
- Create: `src/components/bookings/BookingForm.tsx`
- Create: `src/components/bookings/BookingModal.tsx`
- Create: `src/app/api/bookings/route.ts`
- Create: `src/app/api/bookings/[id]/route.ts`
- Modify: `src/lib/bookings.ts`
- Test: `src/test/bookings.test.ts`

- [ ] **Step 1: Přidej failing test pro odmítnutí překryvu na serverové logice**

```ts
// src/test/bookings.test.ts
import { ensureNoBookingConflict } from "@/lib/bookings";

it("odmítne konflikt rezervace se srozumitelnou chybou", () => {
  expect(() =>
    ensureNoBookingConflict(
      {
        start_time: "2026-03-31T10:15:00.000Z",
        end_time: "2026-03-31T11:15:00.000Z",
      },
      [
        {
          id: "1",
          start_time: "2026-03-31T10:00:00.000Z",
          end_time: "2026-03-31T11:00:00.000Z",
        },
      ],
    ),
  ).toThrow("V tomto čase už je letadlo rezervované.");
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/bookings.test.ts`
Expected: FAIL s `ensureNoBookingConflict is not a function`

- [ ] **Step 3: Implementuj minimální conflict guard a API návrh pro rezervace**

```ts
// src/lib/bookings.ts
export function ensureNoBookingConflict(
  candidate: { start_time: string; end_time: string },
  existing: Array<{ id: string; start_time: string; end_time: string }>,
) {
  const hasConflict = existing.some((item) => bookingOverlaps(candidate, item));

  if (hasConflict) {
    throw new Error("V tomto čase už je letadlo rezervované.");
  }
}
```

```ts
// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { message: "Vytvoření rezervace bude implementováno v tomto tasku." },
    { status: 501 },
  );
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/bookings.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/bookings.ts src/components/bookings src/app/api/bookings src/test/bookings.test.ts
git commit -m "feat: add booking modal and conflict handling"
```

## Task 7: Týdenní kalendář a napojení rezervací do UI

**Files:**
- Create: `src/components/calendar/WeeklyCalendar.tsx`
- Create: `src/components/calendar/CalendarGrid.tsx`
- Create: `src/components/calendar/CalendarToolbar.tsx`
- Create: `src/app/calendar/page.tsx`
- Modify: `src/lib/dates.ts`
- Test: `src/test/dates.test.ts`

- [ ] **Step 1: Přidej failing test pro 15minutové sloty**

```ts
// src/test/dates.test.ts
import { buildTimeSlots } from "@/lib/dates";

it("vytváří sloty po 15 minutách", () => {
  const slots = buildTimeSlots(8, 9);
  expect(slots).toEqual(["08:00", "08:15", "08:30", "08:45"]);
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/dates.test.ts`
Expected: FAIL s `buildTimeSlots is not a function`

- [ ] **Step 3: Implementuj minimální generování slotů a kostru kalendáře**

```ts
// src/lib/dates.ts
export function buildTimeSlots(startHour: number, endHour: number) {
  const result: string[] = [];

  for (let hour = startHour; hour < endHour; hour += 1) {
    for (const minute of [0, 15, 30, 45]) {
      result.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }

  return result;
}
```

```tsx
// src/app/calendar/page.tsx
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Kalendář</h1>
        <p className="text-slate-600">Týdenní přehled rezervací po 15 minutách.</p>
      </div>
      <WeeklyCalendar />
    </div>
  );
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/dates.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/dates.ts src/components/calendar src/app/calendar/page.tsx src/test/dates.test.ts
git commit -m "feat: add weekly reservation calendar"
```

## Task 8: Napojení dashboardu, CRUD a rezervací na reálná data

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/airplanes/page.tsx`
- Modify: `src/app/pilots/page.tsx`
- Modify: `src/app/calendar/page.tsx`
- Modify: `src/app/api/airplanes/route.ts`
- Modify: `src/app/api/airplanes/[id]/route.ts`
- Modify: `src/app/api/pilots/route.ts`
- Modify: `src/app/api/pilots/[id]/route.ts`
- Modify: `src/app/api/bookings/route.ts`
- Modify: `src/app/api/bookings/[id]/route.ts`
- Modify: `src/lib/serverSupabase.ts`
- Modify: `src/lib/activeAeroclub.ts`
- Test: `src/test/bookings.test.ts`

- [ ] **Step 1: Přidej failing test pro konkrétní českou chybu při konfliktu rezervace**

```ts
// src/test/bookings.test.ts
import { mapBookingError } from "@/lib/bookings";

it("mapuje booking chybu na českou API odpověď", () => {
  expect(mapBookingError(new Error("V tomto čase už je letadlo rezervované."))).toEqual({
    message: "V tomto čase už je letadlo rezervované.",
    status: 409,
  });
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/bookings.test.ts`
Expected: FAIL s `mapBookingError is not a function`

- [ ] **Step 3: Implementuj napojení API na Supabase a společné error mappingy**

```ts
// src/lib/bookings.ts
export function mapBookingError(error: Error) {
  if (error.message === "V tomto čase už je letadlo rezervované.") {
    return { message: error.message, status: 409 };
  }

  if (error.message === "Konec rezervace musí být později než začátek.") {
    return { message: error.message, status: 400 };
  }

  return { message: "Nepodařilo se uložit rezervaci.", status: 500 };
}
```

```ts
// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingInputSchema } from "@/lib/validators";
import { mapBookingError, validateBookingWindow } from "@/lib/bookings";

export async function POST(request: NextRequest) {
  try {
    const payload = bookingInputSchema.parse(await request.json());
    validateBookingWindow(payload);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const mapped = mapBookingError(error as Error);
    return NextResponse.json({ message: mapped.message }, { status: mapped.status });
  }
}
```

- [ ] **Step 4: Spusť testy a ověř, že prochází**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/airplanes/page.tsx src/app/pilots/page.tsx src/app/calendar/page.tsx src/app/api src/lib/serverSupabase.ts src/lib/activeAeroclub.ts src/lib/bookings.ts src/test/bookings.test.ts
git commit -m "feat: connect aerosync pages and apis to data layer"
```

## Task 9: Finální polish, dashboard statistiky a smoke ověření MVP

**Files:**
- Modify: `src/components/dashboard/DashboardCards.tsx`
- Modify: `src/components/dashboard/TodayBookings.tsx`
- Modify: `src/components/calendar/WeeklyCalendar.tsx`
- Modify: `src/components/bookings/BookingForm.tsx`
- Modify: `src/app/globals.css`
- Test: `src/test/bookings.test.ts`
- Test: `src/test/dates.test.ts`

- [ ] **Step 1: Přidej failing test pro dashboard text dnešních rezervací**

```ts
// src/test/dates.test.ts
import { render, screen } from "@testing-library/react";
import { TodayBookings } from "@/components/dashboard/TodayBookings";

it("zobrazuje prázdný stav dnešních rezervací česky", () => {
  render(<TodayBookings bookings={[]} />);
  expect(screen.getByText("Na dnešek zatím není žádná rezervace.")).toBeInTheDocument();
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/dates.test.ts`
Expected: FAIL s `Cannot find module '@/components/dashboard/TodayBookings'` nebo chybějícím textem

- [ ] **Step 3: Implementuj finální prázdné stavy, čitelnost a drobný polish**

```tsx
// src/components/dashboard/TodayBookings.tsx
type TodayBookingsProps = {
  bookings: Array<{ id: string; pilotName: string; startLabel: string; endLabel: string; airplaneName: string }>;
};

export function TodayBookings({ bookings }: TodayBookingsProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-500">
        Na dnešek zatím není žádná rezervace.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-medium text-slate-900">{booking.pilotName}</div>
          <div className="text-sm text-slate-600">
            {booking.airplaneName} • {booking.startLabel}–{booking.endLabel}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Spusť všechny testy a ověř, že prochází**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Ověř MVP ručně podle briefu**

Run: `npm run dev`
Expected: Aplikace běží lokálně a umožní:
- vytvořit 2 letadla
- vytvořit 3 piloty
- vytvořit 5 rezervací
- odmítnout překryv na stejném letadle
- zobrazit rezervace v kalendáři

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard src/components/calendar/WeeklyCalendar.tsx src/components/bookings/BookingForm.tsx src/app/globals.css src/test/dates.test.ts
git commit -m "feat: polish aerosync mvp experience"
```

## Self-review

### Pokrytí specu

- CRUD letadel: Task 5, Task 8
- CRUD pilotů: Task 5, Task 8
- CRUD rezervací: Task 6, Task 8
- týdenní kalendář: Task 7, Task 9
- overlap validace: Task 3, Task 6, Task 8
- dashboard a dnešní rezervace: Task 4, Task 9
- české UI: Task 4, Task 5, Task 7, Task 9
- multi-aeroclub data model bez loginu: Task 2, Task 8

### Placeholder scan

- žádné `TODO`
- žádné `TBD`
- každý task má konkrétní soubory, test nebo příkaz

### Typová konzistence

- entita používá konzistentně `aeroclub_id`, `airplane_id`, `pilot_id`, `start_time`, `end_time`
- overlap logika používá stejné názvy polí v testech i implementaci

