alter table public.business_task_milestones add column if not exists location_text text;
drop policy if exists business_task_milestones_read on public.business_task_milestones;
create policy business_task_milestones_read on public.business_task_milestones for select using (
 exists(select 1 from public.tasks t where t.id=task_id and t.task_mode='business_multi' and t.status='funded')
 or exists(select 1 from public.tasks t join public.business_members bm on bm.business_id=t.business_id where t.id=task_id and bm.user_id=auth.uid())
 or exists(select 1 from public.business_task_applications a where a.task_id=task_id and a.runner_id=auth.uid() and a.status='accepted')
);
