update public.payments p
set runner_id=t.runner_id, updated_at=now()
from public.tasks t
where p.task_id=t.id and p.runner_id is null and t.runner_id is not null;

drop policy if exists task_requests_runner_insert on public.task_requests;
create policy task_requests_runner_insert on public.task_requests
for insert with check (
  runner_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id=auth.uid() and p.kyc_status='verified' and p.runner_mode_enabled=true
  )
  and exists (
    select 1 from public.tasks t
    where t.id=task_requests.task_id
      and t.status='funded'
      and t.runner_id is null
      and t.customer_id<>auth.uid()
  )
);
