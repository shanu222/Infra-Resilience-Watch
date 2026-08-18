-- Run this in the Supabase SQL Editor (once).
-- Dashboard: https://supabase.com/dashboard → your project → SQL Editor → New query

create table if not exists public.advisories (
  id text primary key,
  payload jsonb not null,
  status text not null default 'Draft',
  kind text not null default 'advisory',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.library_items (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id text primary key default 'default',
  payload jsonb not null default '{}'::jsonb
);

alter table public.advisories enable row level security;
alter table public.library_items enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "public read published advisories" on public.advisories;
create policy "public read published advisories"
  on public.advisories for select
  to anon, authenticated
  using (status = 'Published' or auth.role() = 'authenticated');

drop policy if exists "admin write advisories" on public.advisories;
create policy "admin write advisories"
  on public.advisories for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "public read library" on public.library_items;
create policy "public read library"
  on public.library_items for select
  to anon, authenticated
  using (true);

drop policy if exists "admin write library" on public.library_items;
create policy "admin write library"
  on public.library_items for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "public read settings" on public.app_settings;
create policy "public read settings"
  on public.app_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "admin write settings" on public.app_settings;
create policy "admin write settings"
  on public.app_settings for all
  to authenticated
  using (true)
  with check (true);

create or replace function public.bump_advisory_view(item_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.advisories
  set payload = jsonb_set(
    coalesce(payload, '{}'::jsonb),
    '{viewCount}',
    to_jsonb(coalesce((payload->>'viewCount')::int, 0) + 1)
  ),
  updated_at = now()
  where id = item_id and status = 'Published';
$$;

grant execute on function public.bump_advisory_view(text) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read media" on storage.objects;
create policy "public read media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "admin write media" on storage.objects;
create policy "admin write media"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

alter table public.advisories replica identity full;
alter table public.library_items replica identity full;
alter table public.app_settings replica identity full;

do $$
begin
  execute 'alter publication supabase_realtime add table public.advisories';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.library_items';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.app_settings';
exception
  when duplicate_object then null;
end $$;
