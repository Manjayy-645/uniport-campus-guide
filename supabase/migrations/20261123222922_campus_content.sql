create type public.campus_content_status as enum ('draft', 'published', 'archived');

create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  aliases text[] not null default '{}',
  category text not null,
  campus_area text not null,
  landmark text not null,
  directions text not null,
  map_url text check (map_url ~ '^https://[^[:space:]]+$'),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  status public.campus_content_status not null default 'draft',
  check ((latitude is null) = (longitude is null))
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (btrim(title) <> ''),
  description text not null,
  organiser text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  cost text not null,
  place_id uuid references public.places (id),
  external_venue text,
  status public.campus_content_status not null default 'draft',
  check (ends_at is null or ends_at >= starts_at)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  category text not null,
  description text not null,
  official_url text check (official_url ~ '^https://[^[:space:]]+$'),
  contact text,
  place_id uuid references public.places (id),
  status public.campus_content_status not null default 'draft'
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (btrim(title) <> ''),
  summary text not null,
  source_url text check (source_url ~ '^https://[^[:space:]]+$'),
  published_at timestamptz,
  expires_at timestamptz,
  status public.campus_content_status not null default 'draft',
  check (status <> 'published' or published_at is not null),
  check (expires_at is null or published_at is null or expires_at > published_at)
);

create index events_place_id_idx on public.events (place_id);
create index services_place_id_idx on public.services (place_id);
create index events_published_start_idx on public.events (starts_at) where status = 'published';
create index announcements_published_date_idx on public.announcements (published_at desc)
  where status = 'published';

do $$
declare
  table_name text;
begin
  foreach table_name in array array['places', 'events', 'services', 'announcements'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    execute format('grant select on table public.%I to anon', table_name);
    execute format('grant select, insert, update on table public.%I to authenticated', table_name);

    -- Only server-managed app metadata can grant campus publishing access.
    execute format(
      'create policy campus_admin_read on public.%I for select to authenticated
       using (((select auth.jwt()) -> ''app_metadata'' -> ''campus_admin'') = ''true''::jsonb)', table_name);
    execute format(
      'create policy campus_admin_create on public.%I for insert to authenticated
       with check (((select auth.jwt()) -> ''app_metadata'' -> ''campus_admin'') = ''true''::jsonb)', table_name);
    execute format(
      'create policy campus_admin_edit on public.%I for update to authenticated
       using (((select auth.jwt()) -> ''app_metadata'' -> ''campus_admin'') = ''true''::jsonb)
       with check (((select auth.jwt()) -> ''app_metadata'' -> ''campus_admin'') = ''true''::jsonb)', table_name);
  end loop;
end;
$$;

create policy public_read_published on public.places for select to anon, authenticated
  using (status = 'published');

create policy public_read_published on public.events for select to anon, authenticated
  using (status = 'published');

create policy public_read_published on public.services for select to anon, authenticated
  using (status = 'published');

create policy public_read_published on public.announcements for select to anon, authenticated
  using (status = 'published' and published_at <= now() and (expires_at is null or expires_at > now()));
