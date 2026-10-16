-- Rolling-window abuse protection for the public property-chat Edge Function.
-- Apply after migrations 001-004. Only service_role may access this table directly.
create table if not exists public.ai_rate_limits (
  client_hash text primary key check (char_length(client_hash) = 64),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 1),
  updated_at timestamptz not null default now()
);

alter table public.ai_rate_limits enable row level security;
revoke all on table public.ai_rate_limits from anon, authenticated;
grant all on table public.ai_rate_limits to service_role;

create or replace function public.consume_ai_rate_limit(
  p_client_hash text,
  p_window_seconds integer default 300,
  p_max_requests integer default 10
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_allowed boolean;
begin
  if p_client_hash is null or p_client_hash !~ '^[a-f0-9]{64}$'
     or p_window_seconds < 30 or p_window_seconds > 3600
     or p_max_requests < 1 or p_max_requests > 100 then
    raise exception 'Invalid rate limit arguments';
  end if;

  insert into public.ai_rate_limits(client_hash, window_started_at, request_count, updated_at)
  values (p_client_hash, v_now, 1, v_now)
  on conflict (client_hash) do update
    set window_started_at = case
          when public.ai_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds)
            then v_now
          else public.ai_rate_limits.window_started_at
        end,
        request_count = case
          when public.ai_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds)
            then 1
          else public.ai_rate_limits.request_count + 1
        end,
        updated_at = v_now;

  select request_count <= p_max_requests
    into v_allowed
    from public.ai_rate_limits
   where client_hash = p_client_hash;

  return coalesce(v_allowed, false);
end;
$$;

revoke all on function public.consume_ai_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_ai_rate_limit(text, integer, integer) to service_role;

-- Opportunistic cleanup; call manually or schedule a database cron job if pg_cron is enabled.
delete from public.ai_rate_limits
where updated_at < now() - interval '2 days';
