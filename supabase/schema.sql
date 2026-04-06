create extension if not exists pgcrypto;

create table if not exists public.salary_entries (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  profession_category text not null,
  job_title text not null,
  monthly_salary_usd integer not null,
  employment_type text not null,
  experience_level text not null,
  note text null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.salary_entries enable row level security;

drop policy if exists "Allow public select salary entries" on public.salary_entries;
create policy "Allow public select salary entries"
  on public.salary_entries
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert salary entries" on public.salary_entries;
create policy "Allow public insert salary entries"
  on public.salary_entries
  for insert
  to anon, authenticated
  with check (true);
