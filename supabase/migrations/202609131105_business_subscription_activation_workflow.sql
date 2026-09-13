create table if not exists public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.business_plans(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  amount_rwf integer not null check (amount_rwf >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected')),
  provider_reference text,
  masked_phone text,
  paid_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_subscriptions enable row level security;

drop policy if exists business_subscriptions_member_read on public.business_subscriptions;
create policy business_subscriptions_member_read on public.business_subscriptions for select to authenticated using (private.is_business_member(business_id, auth.uid()));

drop policy if exists business_subscriptions_admin_all on public.business_subscriptions;
create policy business_subscriptions_admin_all on public.business_subscriptions for all to authenticated using (private.is_admin()) with check (private.is_admin());

grant select on public.business_subscriptions to authenticated;

create index if not exists business_subscriptions_payment_idx on public.business_subscriptions(payment_status,approval_status,created_at desc);

insert into public.business_subscriptions (business_id, owner_user_id, amount_rwf, payment_status, approval_status, paid_at, reviewed_at)
select bp.id,bp.owner_user_id,bp.monthly_price_rwf,
       case when bp.status='active' then 'paid' else 'pending' end,
       case when bp.status='active' then 'approved' else 'pending' end,
       case when bp.status='active' then coalesce(bp.updated_at,bp.created_at) else null end,
       case when bp.status='active' then coalesce(bp.updated_at,bp.created_at) else null end
from public.business_plans bp
where bp.owner_user_id is not null
on conflict (business_id) do nothing;