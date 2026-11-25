-- Merge a guest's local progress into their account in one transaction (FR-026).
-- Runs as the calling user (security invoker) so RLS still applies.
-- Lessons keep the EARLIEST completion; sessions are inserted by client id (idempotent).

create function public.merge_guest_progress(p_completed jsonb, p_sessions jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  merged_lessons int := 0;
  merged_sessions int := 0;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  with input as (
    select
      x ->> 'lessonSlug' as lesson_slug,
      (x ->> 'completedAt')::timestamptz as completed_at,
      (x ->> 'completedOn')::date as completed_on
    from jsonb_array_elements(coalesce(p_completed, '[]'::jsonb)) as x
  ), upserted as (
    insert into public.lesson_progress (user_id, lesson_slug, completed_at, completed_on)
    select uid, lesson_slug, completed_at, completed_on from input
    on conflict (user_id, lesson_slug) do update
      set completed_at = least(public.lesson_progress.completed_at, excluded.completed_at),
          completed_on = least(public.lesson_progress.completed_on, excluded.completed_on),
          updated_at = now()
    returning 1
  )
  select count(*) into merged_lessons from upserted;

  with input as (
    select
      (x ->> 'id')::uuid as id,
      (x ->> 'practicedOn')::date as practiced_on,
      (x ->> 'durationMinutes')::smallint as duration_minutes,
      nullif(x ->> 'lessonSlug', '') as lesson_slug,
      nullif(x ->> 'note', '') as note,
      (x ->> 'bpmReached')::smallint as bpm_reached
    from jsonb_array_elements(coalesce(p_sessions, '[]'::jsonb)) as x
  ), inserted as (
    insert into public.practice_sessions (id, user_id, practiced_on, duration_minutes, lesson_slug, note, bpm_reached)
    select id, uid, practiced_on, duration_minutes, lesson_slug, note, bpm_reached from input
    on conflict (id) do nothing
    returning 1
  )
  select count(*) into merged_sessions from inserted;

  return jsonb_build_object('mergedLessons', merged_lessons, 'mergedSessions', merged_sessions);
end;
$$;

grant execute on function public.merge_guest_progress(jsonb, jsonb) to authenticated;
