-- Anonymous usage counts (FR-036). No user id, IP address, user agent or cookie is stored.
-- Rows are written only by the server (service role); nobody can read them through the API.

create table public.analytics_events (
  id bigint generated always as identity primary key,
  name text not null check (name in ('page_view', 'tool_open', 'lesson_start', 'lesson_complete')),
  path text not null check (char_length(path) <= 200 and position('?' in path) = 0),
  device text not null check (device in ('mobile', 'desktop')),
  occurred_hour timestamptz not null
);

create index analytics_events_hour on public.analytics_events (occurred_hour);

alter table public.analytics_events enable row level security;
-- No policies: anon/authenticated roles have no access. The service role bypasses RLS.
