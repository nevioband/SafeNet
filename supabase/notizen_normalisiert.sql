-- SafeNet Notizen: normalisierte Tabellenstruktur
-- Dieses Script erstellt neue Tabellen, RLS-Policies, eine Migration aus notizen_sync
-- sowie hilfreiche Analyse-Views.

begin;

-- 1) Tabellen
create table if not exists public.notiz_ordner (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  erstellt_am timestamptz not null default now()
);

create table if not exists public.notiz_titel (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  geaendert_am timestamptz not null default now()
);

create table if not exists public.notiz_inhalt (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  geaendert_am timestamptz not null default now()
);

create table if not exists public.notiz_notizen (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  ordner_id text not null references public.notiz_ordner(id) on delete cascade,
  titel_id text not null references public.notiz_titel(id) on delete cascade,
  inhalt_id text not null references public.notiz_inhalt(id) on delete cascade,
  angepinnt boolean not null default false,
  erstellt_am timestamptz not null default now(),
  geaendert_am timestamptz not null default now()
);

-- 2) Indizes
create index if not exists idx_notiz_ordner_user_id on public.notiz_ordner(user_id);
create index if not exists idx_notiz_titel_user_id on public.notiz_titel(user_id);
create index if not exists idx_notiz_inhalt_user_id on public.notiz_inhalt(user_id);
create index if not exists idx_notiz_notizen_user_id on public.notiz_notizen(user_id);
create index if not exists idx_notiz_notizen_ordner_id on public.notiz_notizen(ordner_id);
create index if not exists idx_notiz_notizen_angepinnt on public.notiz_notizen(angepinnt);

-- 3) Eindeutigkeit innerhalb eines Users
create unique index if not exists ux_notiz_ordner_user_ordner on public.notiz_ordner(user_id, id);
create unique index if not exists ux_notiz_titel_user_titel on public.notiz_titel(user_id, id);
create unique index if not exists ux_notiz_inhalt_user_inhalt on public.notiz_inhalt(user_id, id);
create unique index if not exists ux_notiz_notizen_user_notiz on public.notiz_notizen(user_id, id);

-- 4) RLS aktivieren
alter table public.notiz_ordner enable row level security;
alter table public.notiz_titel enable row level security;
alter table public.notiz_inhalt enable row level security;
alter table public.notiz_notizen enable row level security;

-- 5) Alte Policies entfernen (idempotent)
drop policy if exists "notiz_ordner_select_own" on public.notiz_ordner;
drop policy if exists "notiz_ordner_insert_own" on public.notiz_ordner;
drop policy if exists "notiz_ordner_update_own" on public.notiz_ordner;
drop policy if exists "notiz_ordner_delete_own" on public.notiz_ordner;

drop policy if exists "notiz_titel_select_own" on public.notiz_titel;
drop policy if exists "notiz_titel_insert_own" on public.notiz_titel;
drop policy if exists "notiz_titel_update_own" on public.notiz_titel;
drop policy if exists "notiz_titel_delete_own" on public.notiz_titel;

drop policy if exists "notiz_inhalt_select_own" on public.notiz_inhalt;
drop policy if exists "notiz_inhalt_insert_own" on public.notiz_inhalt;
drop policy if exists "notiz_inhalt_update_own" on public.notiz_inhalt;
drop policy if exists "notiz_inhalt_delete_own" on public.notiz_inhalt;

drop policy if exists "notiz_notizen_select_own" on public.notiz_notizen;
drop policy if exists "notiz_notizen_insert_own" on public.notiz_notizen;
drop policy if exists "notiz_notizen_update_own" on public.notiz_notizen;
drop policy if exists "notiz_notizen_delete_own" on public.notiz_notizen;

-- 6) Policies: nur eigene Daten
create policy "notiz_ordner_select_own" on public.notiz_ordner
for select to authenticated
using (auth.uid() = user_id);

create policy "notiz_ordner_insert_own" on public.notiz_ordner
for insert to authenticated
with check (auth.uid() = user_id);

create policy "notiz_ordner_update_own" on public.notiz_ordner
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notiz_ordner_delete_own" on public.notiz_ordner
for delete to authenticated
using (auth.uid() = user_id);

create policy "notiz_titel_select_own" on public.notiz_titel
for select to authenticated
using (auth.uid() = user_id);

create policy "notiz_titel_insert_own" on public.notiz_titel
for insert to authenticated
with check (auth.uid() = user_id);

create policy "notiz_titel_update_own" on public.notiz_titel
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notiz_titel_delete_own" on public.notiz_titel
for delete to authenticated
using (auth.uid() = user_id);

create policy "notiz_inhalt_select_own" on public.notiz_inhalt
for select to authenticated
using (auth.uid() = user_id);

create policy "notiz_inhalt_insert_own" on public.notiz_inhalt
for insert to authenticated
with check (auth.uid() = user_id);

create policy "notiz_inhalt_update_own" on public.notiz_inhalt
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notiz_inhalt_delete_own" on public.notiz_inhalt
for delete to authenticated
using (auth.uid() = user_id);

create policy "notiz_notizen_select_own" on public.notiz_notizen
for select to authenticated
using (auth.uid() = user_id);

create policy "notiz_notizen_insert_own" on public.notiz_notizen
for insert to authenticated
with check (auth.uid() = user_id);

create policy "notiz_notizen_update_own" on public.notiz_notizen
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notiz_notizen_delete_own" on public.notiz_notizen
for delete to authenticated
using (auth.uid() = user_id);

-- 7) Migration von notizen_sync (falls vorhanden)
-- Erwartete Altspalten: user_id, ordner_id, ordner_name, notiz_id, titel, inhalt, angepinnt, erstellt_am, geaendert_am
-- Die Migration ist idempotent durch on conflict do nothing.

insert into public.notiz_ordner (id, user_id, name, erstellt_am)
select distinct
  ns.ordner_id,
  ns.user_id,
  coalesce(ns.ordner_name, 'Standard'),
  coalesce(ns.geaendert_am, now())
from public.notizen_sync ns
where ns.ordner_id is not null
on conflict (id) do nothing;

insert into public.notiz_titel (id, user_id, text, geaendert_am)
select distinct
  ns.notiz_id || '_titel',
  ns.user_id,
  coalesce(ns.titel, 'Neue Notiz'),
  coalesce(ns.geaendert_am, now())
from public.notizen_sync ns
where ns.notiz_id is not null
on conflict (id) do nothing;

insert into public.notiz_inhalt (id, user_id, text, geaendert_am)
select distinct
  ns.notiz_id || '_inhalt',
  ns.user_id,
  coalesce(ns.inhalt, ''),
  coalesce(ns.geaendert_am, now())
from public.notizen_sync ns
where ns.notiz_id is not null
on conflict (id) do nothing;

insert into public.notiz_notizen (
  id,
  user_id,
  ordner_id,
  titel_id,
  inhalt_id,
  angepinnt,
  erstellt_am,
  geaendert_am
)
select distinct
  ns.notiz_id,
  ns.user_id,
  ns.ordner_id,
  ns.notiz_id || '_titel',
  ns.notiz_id || '_inhalt',
  coalesce(ns.angepinnt, false),
  coalesce(ns.erstellt_am, now()),
  coalesce(ns.geaendert_am, now())
from public.notizen_sync ns
where ns.notiz_id is not null
on conflict (id) do nothing;

-- 8) Analyse-View: Notizen pro User
create or replace view public.v_notizen_pro_user
with (security_invoker = true)
as
select
  n.user_id,
  count(*)::bigint as notizen_gesamt,
  count(*) filter (where n.angepinnt)::bigint as notizen_angepinnt,
  count(distinct n.ordner_id)::bigint as ordner_genutzt
from public.notiz_notizen n
where n.user_id = auth.uid()
group by n.user_id;

-- 9) Analyse-View: Notizen pro User und Ordner
create or replace view public.v_notizen_pro_user_ordner
with (security_invoker = true)
as
select
  n.user_id,
  o.id as ordner_id,
  o.name as ordner_name,
  count(*)::bigint as notizen_gesamt,
  count(*) filter (where n.angepinnt)::bigint as notizen_angepinnt
from public.notiz_notizen n
join public.notiz_ordner o on o.id = n.ordner_id
where n.user_id = auth.uid()
group by n.user_id, o.id, o.name;

-- 10) Rechte explizit absichern
revoke all on table public.notiz_ordner from anon;
revoke all on table public.notiz_titel from anon;
revoke all on table public.notiz_inhalt from anon;
revoke all on table public.notiz_notizen from anon;

grant select, insert, update, delete on table public.notiz_ordner to authenticated;
grant select, insert, update, delete on table public.notiz_titel to authenticated;
grant select, insert, update, delete on table public.notiz_inhalt to authenticated;
grant select, insert, update, delete on table public.notiz_notizen to authenticated;

revoke all on public.v_notizen_pro_user from public;
revoke all on public.v_notizen_pro_user_ordner from public;
grant select on public.v_notizen_pro_user to authenticated;
grant select on public.v_notizen_pro_user_ordner to authenticated;

commit;
