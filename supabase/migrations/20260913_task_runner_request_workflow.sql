create table if not exists public.task_requests (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  runner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','withdrawn')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(task_id, runner_id)
);

alter table public.task_requests enable row level security;

drop policy if exists task_requests_runner_read on public.task_requests;
create policy task_requests_runner_read on public.task_requests
for select to authenticated using (runner_id=auth.uid());

drop policy if exists task_requests_customer_read on public.task_requests;
create policy task_requests_customer_read on public.task_requests
for select to authenticated using (
  exists(select 1 from public.tasks t where t.id=task_id and t.customer_id=auth.uid())
);

drop policy if exists task_requests_runner_insert on public.task_requests;
create policy task_requests_runner_insert on public.task_requests
for insert to authenticated with check (
  runner_id=auth.uid()
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.kyc_status='verified' and p.runner_mode_enabled=true)
  and exists(select 1 from public.tasks t where t.id=task_id and t.status='funded' and t.runner_id is null and t.customer_id<>auth.uid())
);

drop policy if exists task_requests_runner_update on public.task_requests;
create policy task_requests_runner_update on public.task_requests
for update to authenticated using (runner_id=auth.uid() and status='pending')
with check (runner_id=auth.uid() and status in ('pending','withdrawn'));

drop policy if exists task_requests_admin_all on public.task_requests;
create policy task_requests_admin_all on public.task_requests
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create index if not exists idx_task_requests_task_status on public.task_requests(task_id,status,created_at desc);
create index if not exists idx_task_requests_runner on public.task_requests(runner_id,status,created_at desc);

create or replace function public.accept_task_runner_request(p_request_id uuid)
returns table(task_id uuid, runner_id uuid, status text)
language plpgsql
security definer
set search_path='public'
as $$
declare
  uid uuid := auth.uid();
  req public.task_requests%rowtype;
  t public.tasks%rowtype;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  select * into req from public.task_requests where id=p_request_id for update;
  if req.id is null then raise exception 'Request not found'; end if;
  select * into t from public.tasks where id=req.task_id for update;
  if t.id is null then raise exception 'Task not found'; end if;
  if t.customer_id<>uid then raise exception 'Only the customer can accept a runner request'; end if;
  if t.status<>'funded' or t.runner_id is not null then raise exception 'Task already has a runner or is not ready'; end if;
  if req.status<>'pending' then raise exception 'Request is no longer pending'; end if;

  update public.tasks set runner_id=req.runner_id,status='accepted',updated_at=now() where id=t.id;
  update public.task_requests
    set status=case when id=req.id then 'accepted' else 'rejected' end,updated_at=now()
    where task_id=t.id and status='pending';

  return query select t.id,req.runner_id,'accepted'::text;
end;$$;

grant execute on function public.accept_task_runner_request(uuid) to authenticated;
