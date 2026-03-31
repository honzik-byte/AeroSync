# AeroSync Auth & Multi-Club Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rozšířit AeroSync o Supabase Auth, více aeroklubů, role `super_admin` / `club_admin` / `pilot`, registraci přes pozvánkový kód a workflow rezervací se schvalováním.

**Architecture:** Auth bude řešen přes Supabase Auth, zatímco aplikační role a členství poběží přes naše vlastní tabulky `profiles`, `aeroclub_members` a `aeroclub_invite_codes`. UI i API se rozdělí podle rolí a rezervace dostanou stavový workflow `pending` / `approved` / `rejected` / `cancelled`, přičemž `pending` i `approved` blokují slot.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Supabase Auth, Supabase Postgres, Zod, Vitest

---

## Cílová struktura souborů

### Nové soubory

- `src/lib/auth.ts`
- `src/lib/currentUser.ts`
- `src/lib/authorization.ts`
- `src/lib/inviteCodes.ts`
- `src/lib/bookingStatus.ts`
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/admin/aeroclubs/page.tsx`
- `src/app/admin/aeroclubs/[id]/page.tsx`
- `src/app/club/members/page.tsx`
- `src/app/club/invites/page.tsx`
- `src/app/club/bookings/pending/page.tsx`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/admin/aeroclubs/route.ts`
- `src/app/api/admin/aeroclubs/[id]/route.ts`
- `src/app/api/club/invites/route.ts`
- `src/app/api/club/members/[id]/route.ts`
- `src/app/api/bookings/[id]/approve/route.ts`
- `src/app/api/bookings/[id]/reject/route.ts`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/admin/AeroclubForm.tsx`
- `src/components/admin/AeroclubsPageClient.tsx`
- `src/components/admin/AeroclubDetailClient.tsx`
- `src/components/club/InviteCodesClient.tsx`
- `src/components/club/MembersClient.tsx`
- `src/components/club/PendingBookingsClient.tsx`
- `src/test/auth.test.ts`
- `src/test/inviteCodes.test.ts`

### Upravené soubory

- `supabase/schema.sql`
- `src/types/index.ts`
- `src/app/dashboard/page.tsx`
- `src/app/calendar/page.tsx`
- `src/components/calendar/CalendarGrid.tsx`
- `src/components/dashboard/DashboardCards.tsx`
- `src/components/dashboard/TodayBookings.tsx`
- `src/app/layout.tsx`
- `src/components/layout/Sidebar.tsx`

## Task 1: Rozšíření databáze pro auth, členství a pozvánkové kódy

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `src/types/index.ts`
- Test: `src/test/auth.test.ts`

- [ ] **Step 1: Napiš failing test pro typ členství v aeroklubu**

```ts
import { describe, expect, it } from "vitest";
import type { AeroclubMember } from "@/types";

describe("AeroclubMember type", () => {
  it("umožňuje klubovou roli pilot", () => {
    const member: AeroclubMember = {
      id: "member-1",
      aeroclub_id: "club-1",
      user_id: "user-1",
      role: "pilot",
      status: "active",
      created_at: "2026-03-31T10:00:00.000Z",
    };

    expect(member.role).toBe("pilot");
  });
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/auth.test.ts`
Expected: FAIL s `AeroclubMember` not found

- [ ] **Step 3: Rozšiř SQL schéma a typy**

```sql
create table if not exists profiles (
  id uuid primary key,
  email text not null,
  full_name text not null,
  global_role text not null default 'user',
  created_at timestamptz not null default now(),
  constraint profiles_global_role_check check (global_role in ('super_admin', 'user'))
);

create table if not exists aeroclub_members (
  id uuid primary key default gen_random_uuid(),
  aeroclub_id uuid not null references aeroclubs(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  constraint aeroclub_members_role_check check (role in ('club_admin', 'pilot')),
  constraint aeroclub_members_status_check check (status in ('active', 'inactive')),
  constraint aeroclub_members_unique unique (aeroclub_id, user_id)
);

create table if not exists aeroclub_invite_codes (
  id uuid primary key default gen_random_uuid(),
  aeroclub_id uuid not null references aeroclubs(id) on delete cascade,
  code text not null unique,
  is_active boolean not null default true,
  used_by_user_id uuid references profiles(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table bookings
  add column if not exists status text not null default 'pending',
  add column if not exists requested_by_user_id uuid references profiles(id) on delete set null,
  add column if not exists approved_by_user_id uuid references profiles(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists rejection_reason text;

alter table bookings
  drop constraint if exists bookings_status_check;

alter table bookings
  add constraint bookings_status_check check (status in ('pending', 'approved', 'rejected', 'cancelled'));
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql src/types/index.ts src/test/auth.test.ts
git commit -m "feat: add auth and membership schema"
```

## Task 2: Supabase Auth utility a načítání aktuálního uživatele

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/currentUser.ts`
- Create: `src/lib/authorization.ts`
- Test: `src/test/auth.test.ts`

- [ ] **Step 1: Napiš failing test pro validní booking status, který blokuje slot**

```ts
import { activeBookingStatuses } from "@/lib/bookingStatus";

it("počítá pending jako blokující stav", () => {
  expect(activeBookingStatuses).toContain("pending");
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/auth.test.ts`
Expected: FAIL s module not found

- [ ] **Step 3: Implementuj auth helpery a authorization primitives**

```ts
export const activeBookingStatuses = ["pending", "approved"] as const;
```

```ts
export async function getCurrentUser() {
  // načti session uživatele z Supabase Auth
}
```

```ts
export async function requireClubAdmin() {
  // ověř, že přihlášený uživatel je club_admin
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/lib/currentUser.ts src/lib/authorization.ts src/lib/bookingStatus.ts src/test/auth.test.ts
git commit -m "feat: add auth and authorization helpers"
```

## Task 3: Registrace přes pozvánkový kód a login stránky

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/RegisterForm.tsx`
- Create: `src/lib/inviteCodes.ts`
- Test: `src/test/inviteCodes.test.ts`

- [ ] **Step 1: Napiš failing test pro jednorázové použití kódu**

```ts
import { describe, expect, it } from "vitest";
import { ensureInviteCodeIsUsable } from "@/lib/inviteCodes";

describe("ensureInviteCodeIsUsable", () => {
  it("odmítne již použitý kód", () => {
    expect(() =>
      ensureInviteCodeIsUsable({
        code: "ABCD1234",
        is_active: true,
        used_at: "2026-03-31T10:00:00.000Z",
      }),
    ).toThrow("Pozvánkový kód už byl použit.");
  });
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/inviteCodes.test.ts`
Expected: FAIL s module not found

- [ ] **Step 3: Implementuj registrační flow přes kód**

```ts
export function ensureInviteCodeIsUsable(invite: {
  code: string;
  is_active: boolean;
  used_at: string | null;
}) {
  if (!invite.is_active) {
    throw new Error("Pozvánkový kód není aktivní.");
  }

  if (invite.used_at) {
    throw new Error("Pozvánkový kód už byl použit.");
  }
}
```

API registrace:

- ověří invite code
- založí `auth user`
- založí `profile`
- založí `aeroclub_member` s rolí `pilot`
- označí kód jako použitý

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/inviteCodes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/login/page.tsx src/app/register/page.tsx src/app/api/auth/register/route.ts src/app/api/auth/login/route.ts src/components/auth src/lib/inviteCodes.ts src/test/inviteCodes.test.ts
git commit -m "feat: add auth pages and invite registration"
```

## Task 4: Správa aeroklubů pro super admina

**Files:**
- Create: `src/app/admin/aeroclubs/page.tsx`
- Create: `src/app/admin/aeroclubs/[id]/page.tsx`
- Create: `src/app/api/admin/aeroclubs/route.ts`
- Create: `src/app/api/admin/aeroclubs/[id]/route.ts`
- Create: `src/components/admin/AeroclubForm.tsx`
- Create: `src/components/admin/AeroclubsPageClient.tsx`
- Create: `src/components/admin/AeroclubDetailClient.tsx`
- Test: `src/test/auth.test.ts`

- [ ] **Step 1: Napiš failing test pro `super_admin` role check**

```ts
import { isSuperAdminRole } from "@/lib/authorization";

it("pozná super admin roli", () => {
  expect(isSuperAdminRole("super_admin")).toBe(true);
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/auth.test.ts`
Expected: FAIL

- [ ] **Step 3: Implementuj správu aeroklubů**

- `super_admin` stránka se seznamem klubů
- formulář pro vytvoření klubu
- detail klubu
- API pro vytvoření a úpravu klubu

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/admin src/components/admin src/app/api/admin src/lib/authorization.ts src/test/auth.test.ts
git commit -m "feat: add super admin aeroclub management"
```

## Task 5: Club admin správa členů a pozvánek

**Files:**
- Create: `src/app/club/members/page.tsx`
- Create: `src/app/club/invites/page.tsx`
- Create: `src/app/api/club/invites/route.ts`
- Create: `src/app/api/club/members/[id]/route.ts`
- Create: `src/components/club/MembersClient.tsx`
- Create: `src/components/club/InviteCodesClient.tsx`
- Test: `src/test/inviteCodes.test.ts`

- [ ] **Step 1: Napiš failing test pro generování kódu**

```ts
import { createInviteCode } from "@/lib/inviteCodes";

it("vytvoří dostatečně dlouhý pozvánkový kód", () => {
  expect(createInviteCode().length).toBeGreaterThanOrEqual(8);
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/inviteCodes.test.ts`
Expected: FAIL

- [ ] **Step 3: Implementuj členy a pozvánkové kódy**

- seznam členů klubu
- změna role člena
- deaktivace členství
- generování nového kódu
- seznam použitých a nepoužitých kódů

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/inviteCodes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/club/members/page.tsx src/app/club/invites/page.tsx src/app/api/club/invites/route.ts src/app/api/club/members/[id]/route.ts src/components/club src/lib/inviteCodes.ts src/test/inviteCodes.test.ts
git commit -m "feat: add club members and invite management"
```

## Task 6: Stav rezervací a schvalování adminem

**Files:**
- Create: `src/app/club/bookings/pending/page.tsx`
- Create: `src/app/api/bookings/[id]/approve/route.ts`
- Create: `src/app/api/bookings/[id]/reject/route.ts`
- Create: `src/components/club/PendingBookingsClient.tsx`
- Modify: `src/app/api/bookings/route.ts`
- Modify: `src/app/api/bookings/[id]/route.ts`
- Modify: `src/lib/bookings.ts`
- Test: `src/test/bookings.test.ts`

- [ ] **Step 1: Napiš failing test pro statusy blokující slot**

```ts
import { bookingBlocksSlot } from "@/lib/bookings";

it("pending rezervace blokuje slot", () => {
  expect(bookingBlocksSlot("pending")).toBe(true);
});

it("rejected rezervace slot neblokuje", () => {
  expect(bookingBlocksSlot("rejected")).toBe(false);
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/bookings.test.ts`
Expected: FAIL

- [ ] **Step 3: Implementuj status workflow rezervací**

- pilot vytváří rezervaci jako `pending`
- `pending` i `approved` blokují slot
- admin může:
  - approve
  - reject
- reject může uložit důvod

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/bookings.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/club/bookings/pending/page.tsx src/app/api/bookings/[id]/approve/route.ts src/app/api/bookings/[id]/reject/route.ts src/components/club/PendingBookingsClient.tsx src/app/api/bookings/route.ts src/app/api/bookings/[id]/route.ts src/lib/bookings.ts src/test/bookings.test.ts
git commit -m "feat: add booking approval workflow"
```

## Task 7: Role-based dashboard a navigace

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/components/dashboard/DashboardCards.tsx`
- Modify: `src/components/dashboard/TodayBookings.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/test/auth.test.ts`

- [ ] **Step 1: Napiš failing test pro zobrazení admin navigace**

```ts
import { getNavigationItemsForRole } from "@/lib/authorization";

it("club admin vidí správu členů", () => {
  const items = getNavigationItemsForRole("club_admin");
  expect(items).toContainEqual(expect.objectContaining({ href: "/club/members" }));
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/auth.test.ts`
Expected: FAIL

- [ ] **Step 3: Implementuj dashboard a sidebar podle role**

- `super_admin` vidí správu klubů
- `club_admin` vidí členy, kódy a pending rezervace
- `pilot` vidí svoje rezervace a kalendář

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `npm run test -- src/test/auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/dashboard src/components/layout/Sidebar.tsx src/app/layout.tsx src/lib/authorization.ts src/test/auth.test.ts
git commit -m "feat: add role based dashboard and navigation"
```

## Task 8: Kalendář a CRUD napojené na role a membership

**Files:**
- Modify: `src/app/calendar/page.tsx`
- Modify: `src/components/calendar/CalendarGrid.tsx`
- Modify: `src/app/airplanes/page.tsx`
- Modify: `src/app/pilots/page.tsx`
- Modify: `src/app/api/airplanes/route.ts`
- Modify: `src/app/api/airplanes/[id]/route.ts`
- Modify: `src/app/api/pilots/route.ts`
- Modify: `src/app/api/pilots/[id]/route.ts`
- Modify: `src/app/api/bookings/route.ts`
- Modify: `src/app/api/bookings/[id]/route.ts`
- Test: `src/test/bookings.test.ts`

- [ ] **Step 1: Napiš failing test pro viditelnost jen aktivních statusů**

```ts
import { visibleCalendarStatuses } from "@/lib/bookingStatus";

it("kalendář zobrazuje pending a approved", () => {
  expect(visibleCalendarStatuses).toEqual(["pending", "approved"]);
});
```

- [ ] **Step 2: Spusť test a ověř, že selže**

Run: `npm run test -- src/test/auth.test.ts`
Expected: FAIL

- [ ] **Step 3: Přepoj role a membership do existujících CRUD a kalendáře**

- všechny dotazy používají členství uživatele místo env-only klubu
- `pilot` vidí a spravuje své rezervace
- `club_admin` vidí všechny rezervace klubu
- `pending` rezervace je v kalendáři odlišená

- [ ] **Step 4: Spusť testy a ověř, že prochází**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/calendar/page.tsx src/components/calendar/CalendarGrid.tsx src/app/airplanes/page.tsx src/app/pilots/page.tsx src/app/api/airplanes/route.ts src/app/api/airplanes/[id]/route.ts src/app/api/pilots/route.ts src/app/api/pilots/[id]/route.ts src/app/api/bookings/route.ts src/app/api/bookings/[id]/route.ts src/lib/bookingStatus.ts src/test/auth.test.ts src/test/bookings.test.ts
git commit -m "feat: connect calendar and crud to membership roles"
```

## Self-review

### Pokrytí specu

- Supabase Auth: Task 2, Task 3
- více aeroklubů: Task 1, Task 4, Task 5
- role `super_admin`, `club_admin`, `pilot`: Task 1, Task 2, Task 7
- registrace přes pozvánkový kód: Task 3, Task 5
- správa aeroklubů: Task 4
- správa členů: Task 5
- schvalování rezervací: Task 6
- blokace slotu pro `pending`: Task 6, Task 8
- role-based dashboard a navigace: Task 7
- role-aware kalendář a CRUD: Task 8

### Placeholder scan

- žádné `TODO`
- žádné `TBD`
- každý task má konkrétní soubory, konkrétní test nebo příkaz

### Typová konzistence

- role názvy: `super_admin`, `club_admin`, `pilot`
- booking statusy: `pending`, `approved`, `rejected`, `cancelled`
- konzistentní používání `aeroclub_id`, `user_id`, `requested_by_user_id`, `approved_by_user_id`
