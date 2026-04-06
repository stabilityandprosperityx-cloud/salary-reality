alter table public.salary_entries
add column if not exists salary_type text not null default 'gross';
