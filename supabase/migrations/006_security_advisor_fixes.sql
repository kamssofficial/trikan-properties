-- Additional hardening from Supabase Security and Performance advisors.
-- Safe, additive changes: no business data is deleted or modified.

-- Help enquiry lookups by property_id avoid scans as the inbox grows.
create index if not exists enquiries_property_id_idx
  on public.enquiries(property_id);

-- These helpers do not require elevated privileges; remove SECURITY DEFINER from
-- the claim-check function and pin search paths for predictable resolution.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create or replace function public.is_trikan_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function public.is_trikan_admin() from public;
grant execute on function public.is_trikan_admin() to anon, authenticated;

-- RLS remains enabled and the table remains unavailable to anon/authenticated.
-- This explicit policy documents the sole permitted database role.
drop policy if exists "Service role manages AI rate limits" on public.ai_rate_limits;
create policy "Service role manages AI rate limits"
on public.ai_rate_limits for all to service_role
using (true)
with check (true);
