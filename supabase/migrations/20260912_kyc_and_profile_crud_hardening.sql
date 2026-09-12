-- Keep authenticated profile edits working while sensitive role/KYC fields remain trigger-guarded.
grant update on table public.profiles to authenticated;

-- Allow users to correct and resubmit KYC after rejection/needs-review.
drop policy if exists "kyc own update draft" on public.kyc_applications;
create policy "kyc own update draft" on public.kyc_applications
for update to authenticated
using (user_id = auth.uid() and status in ('pending','needs_review','rejected'))
with check (user_id = auth.uid());

-- Trusted server-side service-role operations are allowed to perform protected profile changes.
-- User sessions are still restricted by private.is_admin() and the self-pending KYC rule.
create or replace function private.guard_sensitive_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.role is distinct from old.role and not private.is_admin() then
    raise exception 'not authorized to change role';
  end if;

  if new.kyc_status is distinct from old.kyc_status and not private.is_admin() then
    if not (
      new.id = auth.uid()
      and new.kyc_status = 'pending'
      and old.kyc_status in ('not_started','rejected','needs_review')
    ) then
      raise exception 'not authorized to change kyc status';
    end if;
  end if;

  return new;
end;
$$;
