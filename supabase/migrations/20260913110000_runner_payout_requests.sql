create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  runner_id uuid not null references public.profiles(id) on delete cascade,
  amount_rwf integer not null check (amount_rwf > 0),
  phone text not null,
  status text not null default 'requested' check (status in ('requested','processing','paid','rejected','failed')),
  provider_reference text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(payment_id, runner_id)
);
alter table public.payout_requests enable row level security;
drop policy if exists payout_requests_runner_read on public.payout_requests;
create policy payout_requests_runner_read on public.payout_requests for select using (runner_id = auth.uid());
drop policy if exists payout_requests_admin_all on public.payout_requests;
create policy payout_requests_admin_all on public.payout_requests for all using (private.is_admin()) with check (private.is_admin());
grant select on public.payout_requests to authenticated;
