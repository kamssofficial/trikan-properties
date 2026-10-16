-- Temporary verified owner allowlist for Trikan Properties.
-- Keep the allowlisted address fixed to the current owner; replace via a reviewed migration when ownership changes.
-- Existing trusted app_metadata role claims continue to work.
create or replace function public.is_trikan_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'kamssofficial@gmail.com';
$$;

revoke all on function public.is_trikan_admin() from public;
grant execute on function public.is_trikan_admin() to anon, authenticated;
