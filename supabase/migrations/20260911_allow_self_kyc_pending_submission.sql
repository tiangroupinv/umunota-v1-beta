create or replace function private.guard_sensitive_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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
