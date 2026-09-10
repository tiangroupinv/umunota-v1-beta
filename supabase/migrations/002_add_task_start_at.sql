alter table public.tasks
  add column if not exists start_at timestamptz;

alter table public.tasks
  drop constraint if exists tasks_start_before_due_check;

alter table public.tasks
  add constraint tasks_start_before_due_check
  check (start_at is null or due_at is null or start_at < due_at);

comment on column public.tasks.start_at is
  'Scheduled time when the task should begin.';
