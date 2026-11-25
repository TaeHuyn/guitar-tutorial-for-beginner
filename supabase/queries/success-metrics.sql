-- Success metrics as aggregate numbers only (FR-037). Run in the Supabase SQL editor.

-- SC-007: share of registered learners who completed ALL of level 0 within their first 14 days.
with level0(slug) as (
  values ('cau-tao-dan'), ('tu-the-cam-dan'), ('len-day-dan'), ('doc-so-do-hop-am'), ('doc-tab'), ('cam-pick-va-gay')
),
cohort as (
  select user_id, created_at from public.profiles where created_at < now() - interval '14 days'
),
finished as (
  select c.user_id
  from cohort c
  join public.lesson_progress p on p.user_id = c.user_id
  join level0 l on l.slug = p.lesson_slug
  where p.completed_at <= c.created_at + interval '14 days'
  group by c.user_id
  having count(*) = (select count(*) from level0)
)
select
  (select count(*) from cohort) as cohort_size,
  (select count(*) from finished) as completed_level0_in_14_days,
  round(100.0 * (select count(*) from finished) / nullif((select count(*) from cohort), 0), 1) as percent;

-- SC-008: share of registered learners who practised again within 7 days after their first day.
with activity as (
  select user_id, practiced_on as day from public.practice_sessions
  union
  select user_id, completed_on from public.lesson_progress
),
first_day as (
  select user_id, min(day) as first_day from activity group by user_id
),
returned as (
  select distinct f.user_id
  from first_day f
  join activity a on a.user_id = f.user_id and a.day > f.first_day and a.day <= f.first_day + 7
)
select
  (select count(*) from first_day where first_day < current_date - 7) as cohort_size,
  (select count(*) from returned r join first_day f using (user_id) where f.first_day < current_date - 7) as returned_within_7_days,
  round(
    100.0 * (select count(*) from returned r join first_day f using (user_id) where f.first_day < current_date - 7)
      / nullif((select count(*) from first_day where first_day < current_date - 7), 0),
    1
  ) as percent;

-- Anonymous usage over the last 30 days.
select name, device, count(*) as events
from public.analytics_events
where occurred_hour > now() - interval '30 days'
group by name, device
order by name, device;
