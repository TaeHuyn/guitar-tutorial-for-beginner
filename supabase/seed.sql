-- Local development seed. A test learner: hocvien@example.test (sign in with the magic link
-- captured by the local mail viewer at http://127.0.0.1:54324).
insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'hocvien@example.test',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Học viên thử"}',
  now(),
  now()
);

insert into public.lesson_progress (user_id, lesson_slug, completed_at, completed_on) values
  ('00000000-0000-4000-8000-000000000001', 'cau-tao-dan', now() - interval '3 days', current_date - 3),
  ('00000000-0000-4000-8000-000000000001', 'tu-the-cam-dan', now() - interval '2 days', current_date - 2);

insert into public.practice_sessions (id, user_id, practiced_on, duration_minutes, lesson_slug, bpm_reached) values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000001', current_date - 2, 15, 'tu-the-cam-dan', null),
  ('00000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-000000000001', current_date - 1, 20, 'len-day-dan', 60);
