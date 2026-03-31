# AeroSync MVP Design

## Přehled

AeroSync je jednoduchý interní rezervační systém pro aerokluby a letecké školy. Cílem MVP je odstranit chaos v rezervacích letadel a nahradit Excel, papír nebo zprávy přehlednou webovou aplikací.

MVP řeší pouze čtyři hlavní věci:

- správa letadel
- správa pilotů
- správa rezervací
- týdenní kalendář s kontrolou překryvů

MVP záměrně neobsahuje platby, AI, notifikace, pokročilé role, maintenance tracking ani mobilní aplikaci.

## Produktové rozhodnutí

- Aplikace bude celá v češtině.
- MVP bude bez přihlášení uživatelů.
- Databáze bude od začátku připravená pro více aeroklubů.
- Aplikace bude pro MVP pracovat nad jedním aktivním aeroklubem.
- Rezervace budou pracovat v 15minutových slotech.
- Priorita je jednoduchost, čitelnost kalendáře a rychlé vytvoření rezervace.

## Hlavní uživatelský tok

1. Uživatel vytvoří letadlo.
2. Uživatel vytvoří pilota.
3. Uživatel vytvoří rezervaci.
4. Rezervace se zobrazí v týdenním kalendáři.
5. Pokud rezervace koliduje s jinou rezervací stejného letadla, systém ji odmítne.

## Architektura řešení

Projekt bude postavený jako Next.js aplikace s App Routerem, TypeScriptem, Tailwind CSS a databází Supabase.

Vrstevnaté rozdělení:

- frontend pro zobrazení stránek, formulářů a kalendáře
- serverové API routy pro CRUD operace a validaci
- Supabase jako databáze

Databáze nebude volána přímo z browseru pro zápisové operace. Browser bude komunikovat s vlastními API routami v Next.js. Ty provedou validaci a teprve potom zapíší data do Supabase.

## Datový model

### Tabulka `aeroclubs`

- `id: uuid`
- `name: text`
- `created_at: timestamptz`

### Tabulka `airplanes`

- `id: uuid`
- `aeroclub_id: uuid`
- `name: text`
- `type: text`
- `created_at: timestamptz`

### Tabulka `pilots`

- `id: uuid`
- `aeroclub_id: uuid`
- `name: text`
- `email: text nullable`
- `created_at: timestamptz`

### Tabulka `bookings`

- `id: uuid`
- `aeroclub_id: uuid`
- `airplane_id: uuid`
- `pilot_id: uuid`
- `start_time: timestamptz`
- `end_time: timestamptz`
- `created_at: timestamptz`

## Datové vztahy

- každé letadlo patří jednomu aeroklubu
- každý pilot patří jednomu aeroklubu
- každá rezervace patří jednomu aeroklubu
- každá rezervace odkazuje na jedno letadlo
- každá rezervace odkazuje na jednoho pilota

## Stránky aplikace

### `/dashboard`

Účel:

- rychlý přehled po otevření aplikace

Obsah:

- karta s počtem letadel
- karta s počtem pilotů
- karta s počtem dnešních rezervací
- seznam dnešních rezervací
- primární tlačítko `Nová rezervace`

### `/calendar`

Účel:

- hlavní obrazovka celého MVP

Zobrazení:

- týdenní pohled
- sloupce představují letadla
- řádky představují čas
- časová osa je po 15 minutách
- rezervace se vykreslí jako blok v odpovídajícím čase a sloupci

Každý blok rezervace zobrazí:

- jméno pilota
- čas od–do

Interakce:

- klik na prázdný slot otevře formulář nové rezervace
- formulář předvyplní datum, čas a letadlo podle kliknutí
- klik na existující rezervaci otevře úpravu a možnost smazání

### `/airplanes`

Účel:

- CRUD správa letadel

Obsah:

- seznam letadel
- tlačítko pro přidání
- možnost upravit
- možnost smazat

Pole:

- `name`
- `type`

### `/pilots`

Účel:

- CRUD správa pilotů

Obsah:

- seznam pilotů
- tlačítko pro přidání
- možnost upravit
- možnost smazat

Pole:

- `name`
- `email` jako nepovinné pole

## Rezervace a validace

### Pole rezervace

- `pilot`
- `airplane`
- `start_time`
- `end_time`

### Povinná pravidla

1. `end_time` musí být větší než `start_time`
2. pro stejné letadlo nesmí existovat překrývající se rezervace

Pravidlo překryvu:

- `new_start < existing_end`
- `new_end > existing_start`

Pokud obě podmínky platí, rezervace se odmítne.

### Chování při editaci

Při úpravě rezervace se při kontrole překryvu ignoruje právě upravovaná rezervace.

### Chybové hlášky

Aplikace bude vracet srozumitelné české chyby, například:

- `Konec rezervace musí být později než začátek.`
- `V tomto čase už je letadlo rezervované.`

## Mazání záznamů

Z bezpečnostních důvodů nebude možné smazat letadlo ani pilota, pokud mají navázané rezervace.

Chování:

- systém vrátí českou chybovou hlášku
- uživatel bude muset nejdřív smazat související rezervace

Tento přístup je pro MVP jednodušší a bezpečnější než kaskádové mazání.

## UI a UX

Designový směr:

- čistý
- minimalistický
- moderní SaaS vzhled

Pravidla UI:

- sidebar navigace vlevo
- jednoduchý topbar
- zaoblené karty
- dostatek mezer
- žádné vizuální přehlcení
- důraz na čitelnost kalendáře

Jazyk:

- všechny názvy stránek, tlačítek, formulářů a chyb budou v češtině

## Aktivní aeroklub v MVP

Datový model je připravený pro více aeroklubů, ale MVP poběží nad jedním aktivním klubem.

Pro první verzi:

- aplikace načte jeden aktivní aeroklub
- všechny dotazy a zápisy budou filtrované podle jeho `aeroclub_id`

Později půjde tento mechanismus napojit na autentizaci a výběr konkrétního klubu.

## Technická struktura projektu

Předpokládané členění:

- `src/app`
- `src/components`
- `src/lib`
- `src/types`

### `src/app`

- stránky `dashboard`, `calendar`, `airplanes`, `pilots`
- API routy pro CRUD operace

### `src/components`

- layout
- sidebar
- topbar
- tabulky a karty
- formuláře
- booking modal
- kalendářové komponenty

### `src/lib`

- serverový Supabase klient
- booking validace
- pomocné funkce pro datum a kalendář

### `src/types`

- TypeScript typy pro `Aeroclub`, `Airplane`, `Pilot`, `Booking`

## API návrh

Předpokládané endpointy:

- `POST /api/airplanes`
- `PATCH /api/airplanes/[id]`
- `DELETE /api/airplanes/[id]`
- `POST /api/pilots`
- `PATCH /api/pilots/[id]`
- `DELETE /api/pilots/[id]`
- `POST /api/bookings`
- `PATCH /api/bookings/[id]`
- `DELETE /api/bookings/[id]`

Každý zápis:

- zvaliduje vstup
- ověří příslušnost k aktivnímu aeroklubu
- provede booking business logiku
- vrátí českou chybovou nebo úspěšnou odpověď

## Kalendář

Kalendář je nejdůležitější část MVP.

Požadavky:

- týdenní navigace mezi týdny
- sloupce podle letadel
- vizuálně čitelné bloky rezervací
- jednoduché založení rezervace kliknutím do mřížky
- editace rezervace kliknutím na blok

Nejdůležitější metrika kvality:

- uživatel musí během pár sekund pochopit, které letadlo je kdy volné a které je obsazené

## Testovací scénář MVP

1. vytvořit 2 letadla
2. vytvořit 3 piloty
3. vytvořit 5 rezervací
4. pokusit se vytvořit překryv na stejném letadle
5. systém musí rezervaci odmítnout
6. kalendář musí správně zobrazit vytvořené rezervace

## Co do MVP nepatří

- platby
- marketplace logika
- AI funkce
- notifikace
- pokročilé role
- maintenance tracking
- mobilní aplikace

## Kritéria dokončení MVP

MVP bude považováno za hotové, pokud:

- funguje CRUD letadel
- funguje CRUD pilotů
- funguje CRUD rezervací
- kalendář zobrazuje rezervace v týdenním pohledu
- překryv rezervací je zablokovaný
- UI je použitelné, čitelné a celé v češtině

## Otevřená rozhodnutí pro pozdější fázi

Tyto věci nejsou blokující pro MVP a odkládají se:

- autentizace uživatelů
- oddělení oprávnění podle rolí
- výběr aeroklubu podle uživatele
- notifikace a připomínky
- pokročilé provozní funkce
