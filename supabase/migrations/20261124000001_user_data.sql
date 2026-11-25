-- User data for the MVP (data-model.md §2). Every table has Row Level Security:
-- a user can only read and write their own rows. Deleting an auth user cascades.

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 50),
  timezone text not null default 'Asia/Ho_Chi_Minh',
  current_level smallint not null default 0 check (current_level between 0 and 5),
  created_at timestamptz not null default now()
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  lesson_slug text not null check (lesson_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null default 'completed' check (status = 'completed'),
  completed_at timestamptz not null,
  completed_on date not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

create table public.practice_sessions (
  id uuid primary key,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  practiced_on date not null,
  duration_minutes smallint not null check (duration_minutes between 1 and 600),
  lesson_slug text check (lesson_slug is null or lesson_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  note text check (note is null or char_length(note) <= 500),
  bpm_reached smallint check (bpm_reached is null or bpm_reached between 30 and 250),
  created_at timestamptz not null default now()
);

create index practice_sessions_user_day on public.practice_sessions (user_id, practiced_on desc);

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.practice_sessions enable row level security;

create policy "own profile: select" on public.profiles for select using ((select auth.uid()) = user_id);
create policy "own profile: update" on public.profiles for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "own progress: select" on public.lesson_progress for select using ((select auth.uid()) = user_id);
create policy "own progress: insert" on public.lesson_progress for insert with check ((select auth.uid()) = user_id);
create policy "own progress: update" on public.lesson_progress for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "own progress: delete" on public.lesson_progress for delete using ((select auth.uid()) = user_id);

create policy "own sessions: select" on public.practice_sessions for select using ((select auth.uid()) = user_id);
create policy "own sessions: insert" on public.practice_sessions for insert with check ((select auth.uid()) = user_id);
create policy "own sessions: update" on public.practice_sessions for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "own sessions: delete" on public.practice_sessions for delete using ((select auth.uid()) = user_id);

-- Create a profile automatically for every new auth user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), 50)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
