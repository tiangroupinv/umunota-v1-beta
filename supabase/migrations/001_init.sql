create extension if not exists pgcrypto;
create type public.task_status as enum ('draft','posted','funding_pending','funded','accepted','in_progress','completion_submitted','payment_requested','approved','disputed','paid','cancelled');
create type public.kyc_status as enum ('not_started','pending','needs_review','verified','rejected');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text not null,phone text,kyc_status public.kyc_status not null default 'not_started',trust_score int not null default 0 check(trust_score between 0 and 100),created_at timestamptz not null default now());
create table public.tasks(id uuid primary key default gen_random_uuid(),client_id uuid not null references public.profiles(id),runner_id uuid references public.profiles(id),title text not null,description text not null,budget_rwf bigint not null check(budget_rwf>0),location_text text not null,proof_requirement text not null,status public.task_status not null default 'posted',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.task_events(id bigint generated always as identity primary key,task_id uuid not null references public.tasks(id) on delete cascade,actor_id uuid not null references public.profiles(id),from_status public.task_status,to_status public.task_status not null,note text,metadata jsonb not null default '{}',created_at timestamptz not null default now());
create table public.task_proofs(id uuid primary key default gen_random_uuid(),task_id uuid not null references public.tasks(id) on delete cascade,runner_id uuid not null references public.profiles(id),storage_path text not null,note text,created_at timestamptz not null default now());
create table public.payment_intents(id uuid primary key default gen_random_uuid(),task_id uuid not null unique references public.tasks(id),provider text not null,provider_reference text,status text not null default 'created',amount_rwf bigint not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.ratings(id uuid primary key default gen_random_uuid(),task_id uuid not null references public.tasks(id),author_id uuid not null references public.profiles(id),subject_id uuid not null references public.profiles(id),stars int not null check(stars between 1 and 5),comment text,created_at timestamptz not null default now(),unique(task_id,author_id,subject_id));
create table public.posts(id uuid primary key default gen_random_uuid(),author_id uuid not null references public.profiles(id),task_id uuid references public.tasks(id),body text not null,rating int check(rating between 1 and 5),created_at timestamptz not null default now());
create table public.comments(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts(id) on delete cascade,author_id uuid not null references public.profiles(id),body text not null,created_at timestamptz not null default now());
alter table public.profiles enable row level security;alter table public.tasks enable row level security;alter table public.task_events enable row level security;alter table public.task_proofs enable row level security;alter table public.payment_intents enable row level security;alter table public.ratings enable row level security;alter table public.posts enable row level security;alter table public.comments enable row level security;
create policy "profiles readable" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid()=id) with check(auth.uid()=id);
create policy "tasks readable" on public.tasks for select to authenticated using (true);
create policy "clients create tasks" on public.tasks for insert to authenticated with check(auth.uid()=client_id);
create policy "task participants update" on public.tasks for update to authenticated using(auth.uid()=client_id or auth.uid()=runner_id);
create policy "posts readable" on public.posts for select using(true);
create policy "author creates post" on public.posts for insert to authenticated with check(auth.uid()=author_id);
create policy "comments readable" on public.comments for select using(true);
create policy "author creates comment" on public.comments for insert to authenticated with check(auth.uid()=author_id);

create index if not exists tasks_client_id_idx on public.tasks(client_id,created_at desc);
create index if not exists tasks_runner_id_idx on public.tasks(runner_id,created_at desc);
create index if not exists tasks_status_idx on public.tasks(status,created_at desc);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists comments_post_id_idx on public.comments(post_id,created_at);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,full_name,phone)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name','New member'),new.raw_user_meta_data->>'phone')
 on conflict(id) do nothing;
 return new;
end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create policy "participants read task events" on public.task_events for select to authenticated using(exists(select 1 from public.tasks t where t.id=task_id and (t.client_id=auth.uid() or t.runner_id=auth.uid())));
create policy "participants create task events" on public.task_events for insert to authenticated with check(actor_id=auth.uid() and exists(select 1 from public.tasks t where t.id=task_id and (t.client_id=auth.uid() or t.runner_id=auth.uid())));
create policy "participants read proofs" on public.task_proofs for select to authenticated using(exists(select 1 from public.tasks t where t.id=task_id and (t.client_id=auth.uid() or t.runner_id=auth.uid())));
create policy "runner creates proof" on public.task_proofs for insert to authenticated with check(runner_id=auth.uid());
create policy "participants read payment intents" on public.payment_intents for select to authenticated using(exists(select 1 from public.tasks t where t.id=task_id and (t.client_id=auth.uid() or t.runner_id=auth.uid())));
create policy "ratings readable" on public.ratings for select using(true);
create policy "participant rates participant" on public.ratings for insert to authenticated with check(author_id=auth.uid() and author_id<>subject_id and exists(select 1 from public.tasks t where t.id=task_id and t.status='paid' and ((t.client_id=author_id and t.runner_id=subject_id) or (t.runner_id=author_id and t.client_id=subject_id))));
