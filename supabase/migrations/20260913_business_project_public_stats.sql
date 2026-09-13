create or replace function public.business_project_public_stats(p_task_id uuid)
returns table(accepted_count bigint,pending_count bigint,runners_needed integer,open_positions integer)
language sql security definer set search_path=public stable as $$
 select
  count(*) filter (where a.status='accepted')::bigint,
  count(*) filter (where a.status='pending')::bigint,
  t.runners_needed,
  greatest(t.runners_needed-(count(*) filter (where a.status='accepted'))::integer,0)
 from public.tasks t left join public.business_task_applications a on a.task_id=t.id
 where t.id=p_task_id and t.task_mode='business_multi' and (t.status='funded' or exists(select 1 from public.business_members bm where bm.business_id=t.business_id and bm.user_id=auth.uid()))
 group by t.runners_needed;
$$;
grant execute on function public.business_project_public_stats(uuid) to authenticated;
