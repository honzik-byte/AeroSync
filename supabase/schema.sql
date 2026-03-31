create extension if not exists pgcrypto;

create table if not exists aeroclubs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key,
  email text not null,
  full_name text not null,
  global_role text not null default 'user',
  created_at timestamptz not null default now(),
  constraint profiles_global_role_check check (global_role in ('super_admin', 'user'))
);

create table if not exists airplanes (
  id uuid primary key default gen_random_uuid(),
  aeroclub_id uuid not null references aeroclubs(id) on delete restrict,
  name text not null,
  type text not null,
  created_at timestamptz not null default now(),
  constraint airplanes_id_aeroclub_unique unique (id, aeroclub_id)
);

create table if not exists pilots (
  id uuid primary key default gen_random_uuid(),
  aeroclub_id uuid not null references aeroclubs(id) on delete restrict,
  name text not null,
  email text,
  created_at timestamptz not null default now(),
  constraint pilots_id_aeroclub_unique unique (id, aeroclub_id)
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

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  aeroclub_id uuid not null references aeroclubs(id) on delete restrict,
  airplane_id uuid not null,
  pilot_id uuid not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now(),
  constraint bookings_time_order_check check (end_time > start_time),
  constraint bookings_airplane_aeroclub_fk
    foreign key (airplane_id, aeroclub_id)
    references airplanes(id, aeroclub_id)
    on delete restrict,
  constraint bookings_pilot_aeroclub_fk
    foreign key (pilot_id, aeroclub_id)
    references pilots(id, aeroclub_id)
    on delete restrict
);

alter table if exists bookings
  add column if not exists status text not null default 'pending',
  add column if not exists requested_by_user_id uuid references profiles(id) on delete set null,
  add column if not exists approved_by_user_id uuid references profiles(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists rejection_reason text;

alter table if exists bookings
  drop constraint if exists bookings_status_check;

alter table if exists bookings
  add constraint bookings_status_check check (status in ('pending', 'approved', 'rejected', 'cancelled'));

create index if not exists airplanes_aeroclub_id_idx on airplanes (aeroclub_id);
create index if not exists pilots_aeroclub_id_idx on pilots (aeroclub_id);
create index if not exists bookings_aeroclub_time_idx on bookings (aeroclub_id, start_time, end_time);
create index if not exists bookings_airplane_time_idx on bookings (airplane_id, start_time, end_time);

insert into aeroclubs (slug, name)
values ('demo-aeroklub', 'Demo Aeroklub')
on conflict (slug) do nothing;
