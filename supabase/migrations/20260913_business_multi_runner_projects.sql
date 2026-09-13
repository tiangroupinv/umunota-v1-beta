alter table public.tasks add column if not exists task_mode text not null default 'single';
alter table public.tasks add column if not exists runners_needed integer not null default 1;
alter table public.tasks add column if not exists pay_per_runner_rwf integer;
alter table public.tasks add column if not exists project_end_at timestamptz;
alter table public.tasks add column if not exists business_project_status text;

create table if not exists public.business_task_applications (
 id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
 runner_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','accepted','rejected','withdrawn','removed','completed')),
 message text, requested_at timestamptz not null default now(), reviewed_at timestamptz,
 reviewed_by uuid references public.profiles(id), updated_at timestamptz not null default now(), unique(task_id,runner_id)
);
create table if not exists public.business_task_milestones (
 id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
 title text not null, description text, starts_at timestamptz, due_at timestamptz,
 sequence_no integer not null default 1, status text not null default 'planned' check (status in ('planned','active','review','completed','cancelled')),
 pay_per_runner_rwf integer not null default 0 check (pay_per_runner_rwf >= 0), created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.business_runner_progress (
 id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
 runner_id uuid not null references public.profiles(id) on delete cascade,
 milestone_id uuid references public.business_task_milestones(id) on delete cascade,
 status text not null default 'not_started' check (status in ('not_started','active','submitted','approved','rejected')),
 note text, started_at timestamptz, submitted_at timestamptz, approved_at timestamptz, updated_at timestamptz not null default now(),
 unique(task_id,runner_id,milestone_id)
);
create table if not exists public.business_runner_earnings (
 id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tasks(id) on delete cascade,
 runner_id uuid not null references public.profiles(id) on delete cascade,
 milestone_id uuid references public.business_task_milestones(id) on delete set null,
 amount_rwf integer not null check (amount_rwf > 0),
 status text not null default 'pending' check (status in ('pending','approved','withdrawal_requested','processing','paid','rejected')),
 approved_by uuid references public.profiles(id), approved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(task_id,runner_id,milestone_id)
);
create index if not exists idx_business_task_applications_task on public.business_task_applications(task_id,status);
create index if not exists idx_business_task_milestones_task on public.business_task_milestones(task_id,sequence_no);
create index if not exists idx_business_runner_progress_task on public.business_runner_progress(task_id,runner_id);
create index if not exists idx_business_runner_earnings_runner on public.business_runner_earnings(runner_id,status);
alter table public.business_task_applications enable row level security;
alter table public.business_task_milestones enable row level security;
alter table public.business_runner_progress enable row level security;
alter table public.business_runner_earnings enable row level security;

drop policy if exists business_task_applications_runner_read on public.business_task_applications;
drop policy if exists business_task_applications_business_read on public.business_task_applications;
drop policy if exists business_task_applications_runner_insert on public.business_task_applications;
drop policy if exists business_task_applications_runner_update on public.business_task_applications;
create policy business_task_applications_runner_read on public.business_task_applications for select using (runner_id=auth.uid());
create policy business_task_applications_business_read on public.business_task_applications for select using (exists(select 1 from public.tasks t join public.business_members bm on bm.business_id=t.business_id where t.id=task_id and bm.user_id=auth.uid()));
create policy business_task_applications_runner_insert on public.business_task_applications for insert with check (runner_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.kyc_status='verified' and p.runner_mode_enabled=true) and exists(select 1 from public.tasks t where t.id=task_id and t.task_mode='business_multi' and t.status='funded'));
create policy business_task_applications_runner_update on public.business_task_applications for update using (runner_id=auth.uid()) with check (runner_id=auth.uid() and status in ('pending','withdrawn'));

drop policy if exists business_task_milestones_read on public.business_task_milestones;
create policy business_task_milestones_read on public.business_task_milestones for select using (exists(select 1 from public.tasks t where t.id=task_id and (exists(select 1 from public.business_members bm where bm.business_id=t.business_id and bm.user_id=auth.uid()) or exists(select 1 from public.business_task_applications a where a.task_id=t.id and a.runner_id=auth.uid() and a.status='accepted'))));
drop policy if exists business_runner_progress_read on public.business_runner_progress;
create policy business_runner_progress_read on public.business_runner_progress for select using (runner_id=auth.uid() or exists(select 1 from public.tasks t join public.business_members bm on bm.business_id=t.business_id where t.id=task_id and bm.user_id=auth.uid()));
drop policy if exists business_runner_earnings_read on public.business_runner_earnings;
create policy business_runner_earnings_read on public.business_runner_earnings for select using (runner_id=auth.uid() or exists(select 1 from public.tasks t join public.business_members bm on bm.business_id=t.business_id where t.id=task_id and bm.user_id=auth.uid()));
grant select,insert,update on public.business_task_applications to authenticated;
grant select on public.business_task_milestones, public.business_runner_progress, public.business_runner_earnings to authenticated;

create or replace function public.accept_business_runner_application(p_application_id uuid)
returns table(task_id uuid, runner_id uuid, accepted_count bigint, runners_needed integer)
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); app public.business_task_applications%rowtype; t public.tasks%rowtype; cnt bigint;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 select * into app from public.business_task_applications where id=p_application_id for update;
 if app.id is null then raise exception 'Application not found'; end if;
 select * into t from public.tasks where id=app.task_id for update;
 if t.id is null or t.task_mode<>'business_multi' then raise exception 'Business project not found'; end if;
 if not exists(select 1 from public.business_members bm where bm.business_id=t.business_id and bm.user_id=uid and bm.role in ('owner','manager')) then raise exception 'Only workspace owners or managers can accept runners'; end if;
 if t.status<>'funded' then raise exception 'Project funding must be confirmed first'; end if;
 select count(*) into cnt from public.business_task_applications where task_id=t.id and status='accepted';
 if cnt>=t.runners_needed then raise exception 'All runner positions are already filled'; end if;
 update public.business_task_applications set status='accepted',reviewed_at=now(),reviewed_by=uid,updated_at=now() where id=app.id and status='pending';
 if not found then raise exception 'Application is no longer pending'; end if;
 select count(*) into cnt from public.business_task_applications where task_id=t.id and status='accepted';
 if cnt>=t.runners_needed then update public.tasks set business_project_status='staffed',updated_at=now() where id=t.id; end if;
 return query select t.id,app.runner_id,cnt,t.runners_needed;
end $$;
grant execute on function public.accept_business_runner_application(uuid) to authenticated;