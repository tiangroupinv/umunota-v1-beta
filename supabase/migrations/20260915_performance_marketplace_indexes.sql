-- Hot-path indexes for marketplace, personal task lists and community feeds.
create index if not exists tasks_marketplace_funded_created_idx
  on public.tasks (created_at desc)
  where status = 'funded';

create index if not exists tasks_customer_status_created_idx
  on public.tasks (customer_id, status, created_at desc);

create index if not exists business_task_applications_runner_status_idx
  on public.business_task_applications (runner_id, status, task_id);

create index if not exists post_likes_user_post_idx
  on public.post_likes (user_id, post_id);

create index if not exists post_shares_post_created_idx
  on public.post_shares (post_id, created_at desc);

create index if not exists profile_follows_follower_created_idx
  on public.profile_follows (follower_id, created_at desc);
