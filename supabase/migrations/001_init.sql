create extension if not exists pgcrypto;
create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete cascade,
 name text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.captures (
 id uuid primary key default gen_random_uuid(),
 project_id uuid references public.projects(id) on delete cascade,
 user_id uuid references auth.users(id) on delete cascade,
 source_url text not null,
 page_title text,
 capture_mode text not null check (capture_mode in ('full','section')),
 viewport jsonb not null default '{}'::jsonb,
 design_json jsonb not null default '{}'::jsonb,
 screenshot_path text,
 created_at timestamptz not null default now()
);
alter table public.projects enable row level security;
alter table public.captures enable row level security;
create policy "Users manage own projects" on public.projects for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Users manage own captures" on public.captures for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
