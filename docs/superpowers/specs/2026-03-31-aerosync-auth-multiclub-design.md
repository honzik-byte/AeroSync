# AeroSync Auth & Multi-Club Design

## Přehled

Tento návrh rozšiřuje AeroSync z jednoduchého MVP bez přihlášení na víceaeroklubový systém s autentizací, rolemi, pozvánkovými kódy a schvalováním rezervací.

Cílem je zachovat jednoduchost produktu, ale přidat:

- více aeroklubů v jedné aplikaci
- přihlášení přes Supabase Auth
- oddělení oprávnění podle role
- samoobslužnou registraci přes pozvánkový kód
- workflow rezervací se schvalováním

## Produktové rozhodnutí

- autentizace bude přes `Supabase Auth`
- existují tři role:
  - `super_admin`
  - `club_admin`
  - `pilot`
- `super_admin` spravuje všechny aerokluby
- `club_admin` spravuje jen svůj aeroklub
- `pilot` může vytvářet rezervace ve svém klubu
- pilot se registruje sám přes pozvánkový kód
- pozvánkový kód je obecný pro vstup do konkrétního klubu
- rezervace vytvořená pilotem má stav `pending`
- i `pending` rezervace blokuje slot v kalendáři
- admin rezervaci schválí nebo zamítne

## Role a oprávnění

### `super_admin`

Může:

- vytvářet aerokluby
- spravovat všechny aerokluby
- zobrazit detail libovolného klubu
- vytvářet pozvánkové kódy pro kluby
- vidět všechny členy a rezervace napříč kluby

### `club_admin`

Může:

- spravovat letadla svého klubu
- spravovat členy svého klubu
- vytvářet pozvánkové kódy svého klubu
- vidět rezervace svého klubu
- schválit nebo zamítnout čekající rezervaci
- vytvářet rezervace přímo

### `pilot`

Může:

- přihlásit se do svého klubu
- vidět kalendář svého klubu
- vytvářet rezervace
- upravovat nebo rušit své rezervace podle pravidel aplikace
- sledovat stav svých rezervací

## Architektura řešení

Autentizace a session budou řešené přes `Supabase Auth`. Aplikační oprávnění, role a členství budou uložené v našich vlastních tabulkách v databázi.

Architektura bude mít tři vrstvy:

- `Supabase Auth` pro identitu a login
- aplikační tabulky pro profily, členství, kluby a pozvánky
- Next.js serverovou vrstvu pro autorizaci, validaci a business logiku

Frontend bude podle přihlášeného uživatele a jeho role rozhodovat, které sekce se zobrazí. Serverová logika bude vždy znovu ověřovat členství a oprávnění, aby nešlo bezpečnost obejít jen přes UI.

## Datový model

### Existující tabulky

Zůstávají:

- `aeroclubs`
- `airplanes`
- `pilots`
- `bookings`

Tyto tabulky se rozšíří o vazbu na přihlášené uživatele a stavový workflow.

### Nová tabulka `profiles`

Účel:

- aplikační profil navázaný na `auth.users`

Pole:

- `id` = stejné jako `auth.users.id`
- `email`
- `full_name`
- `global_role`
- `created_at`

`global_role`:

- `super_admin`
- `user`

### Nová tabulka `aeroclub_members`

Účel:

- propojí uživatele s konkrétním aeroklubem

Pole:

- `id`
- `aeroclub_id`
- `user_id`
- `role`
- `status`
- `created_at`

`role`:

- `club_admin`
- `pilot`

`status`:

- `active`
- `inactive`

Pravidla:

- běžný uživatel bude mít aktivní členství v klubu
- role v klubu se bude číst odsud

### Nová tabulka `aeroclub_invite_codes`

Účel:

- jednorázové kódy pro vstup do klubu

Pole:

- `id`
- `aeroclub_id`
- `code`
- `is_active`
- `used_by_user_id` nullable
- `used_at` nullable
- `created_at`

Pravidla:

- kód je unikátní
- kód je jednorázový
- po použití se označí jako použitý
- kód patří přesně jednomu klubu

### Rozšíření tabulky `bookings`

Přidat:

- `status`
- `requested_by_user_id`
- `approved_by_user_id` nullable
- `approved_at` nullable
- `rejection_reason` nullable

`status`:

- `pending`
- `approved`
- `rejected`
- `cancelled`

Pravidla:

- `pending` blokuje slot
- `approved` blokuje slot
- `rejected` slot neblokuje
- `cancelled` slot neblokuje

## Registrace a login

### Registrace

Stránka:

- `/register`

Pole:

- jméno
- e-mail
- heslo
- pozvánkový kód

Průběh:

1. uživatel vyplní formulář
2. systém ověří, že pozvánkový kód existuje a je aktivní
3. vytvoří se uživatel v `Supabase Auth`
4. vytvoří se záznam v `profiles`
5. vytvoří se záznam v `aeroclub_members`
6. kód se označí jako použitý

Výchozí role po registraci:

- `pilot`

### Login

Stránka:

- `/login`

Pole:

- e-mail
- heslo

Po přihlášení:

- načte se profil
- načte se aktivní členství
- podle role se uživatel pošle na správnou část aplikace

## Workflow rezervací

### Pilot vytvoří rezervaci

1. klikne do kalendáře
2. vyplní rezervaci
3. rezervace se uloží jako `pending`
4. slot se okamžitě zablokuje

### Club admin vyřídí rezervaci

Admin může:

- schválit
- zamítnout

Při schválení:

- `status = approved`
- uloží se `approved_by_user_id`
- uloží se `approved_at`

Při zamítnutí:

- `status = rejected`
- volitelně se uloží `rejection_reason`

### Pravidla překryvu

Překryv se kontroluje nad stavy:

- `pending`
- `approved`

Ignorují se:

- `rejected`
- `cancelled`

To znamená, že pilot nemůže vytvořit rezervaci do slotu, kde už čeká nebo existuje jiná aktivní rezervace stejného letadla.

## Stránky a sekce

### Veřejné

- `/login`
- `/register`

### Pro všechny přihlášené podle role

- `/dashboard`
- `/calendar`

### Pro `club_admin`

- `/airplanes`
- `/pilots`
- `/club/members`
- `/club/invites`
- `/club/bookings/pending`

### Pro `super_admin`

- `/admin/aeroclubs`
- `/admin/aeroclubs/[id]`

## Chování dashboardu podle role

### `super_admin`

Zobrazí:

- počet aeroklubů
- rychlý vstup do správy klubů
- základní systémový přehled

### `club_admin`

Zobrazí:

- počet letadel
- počet pilotů nebo členů
- počet čekajících rezervací
- dnešní rezervace

### `pilot`

Zobrazí:

- moje nadcházející rezervace
- moje čekající rezervace
- rychlý vstup do kalendáře

## Kalendář

Kalendář zůstane týdenní a bude hlavní pracovní plochou.

Pravidla:

- uživatel vidí jen data svého klubu
- `pilot` může zakládat rezervace
- `club_admin` může rezervace schvalovat a spravovat
- `super_admin` může kluby auditovat podle potřeby

Vizuální odlišení stavů:

- `pending` = amber/orange
- `approved` = blue/sky
- `rejected` se v hlavním kalendáři nemusí zobrazovat

## Správa aeroklubů

### Vytvoření aeroklubu

Jen `super_admin`.

Při vytvoření:

- vznikne nový záznam v `aeroclubs`
- lze vygenerovat první pozvánkový kód
- lze později přiřadit prvního `club_admin`

### Správa členů

`club_admin` spravuje svůj klub:

- seznam členů
- změna role
- deaktivace členství

## Bezpečnost

- autentizace přes `Supabase Auth`
- autorizace přes `profiles` + `aeroclub_members`
- všechny serverové akce musí ověřit:
  - přihlášeného uživatele
  - roli
  - klubovou příslušnost
- `service role` klíč zůstane jen v serverové části
- klient nikdy nesmí dostat přístup k privilegovaným operacím

## Kritéria dokončení této verze

Tato rozšířená verze bude hotová, pokud:

- funguje registrace přes pozvánkový kód
- funguje login přes Supabase Auth
- existuje rozlišení rolí `super_admin`, `club_admin`, `pilot`
- `super_admin` umí vytvořit aeroklub
- `club_admin` umí spravovat svůj klub
- `pilot` umí vytvořit rezervaci
- `club_admin` umí rezervaci schválit nebo zamítnout
- `pending` rezervace blokuje slot
- uživatelé vidí jen data svého klubu

## Co zatím neřešit

- e-mailové notifikace
- reset hesla mimo standardní Supabase flow
- složité audit logy
- více rolí než výše definované
- billing nebo marketplace logiku
