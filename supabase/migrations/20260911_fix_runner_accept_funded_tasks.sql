drop policy if exists tasks_verified_runner_accept on public.tasks;

create policy tasks_verified_runner_accept on public.tasks
for update to authenticated
using (
  runner_id is null
  and status = 'funded'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.kyc_status = 'verified'
  )
)
with check (
  runner_id = auth.uid()
  and status = 'accepted'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.kyc_status = 'verified'
  )
);
