-- CourseLab v0.6: learner lesson progress and isolated instructor test progress.
-- Run AFTER migrations 01A, 01B1, 01B2, 01B3. Does not alter existing course content.
begin;
create table if not exists public.learner_lesson_progress (
  course_id uuid not null references public.courses(id) on delete cascade,
  learner_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null,
  version_id uuid not null,
  completed_at timestamptz not null default now(),
  primary key (course_id,learner_id,lesson_id,version_id),
  foreign key (course_id,version_id) references public.course_versions(course_id,id) on delete cascade
);
create table if not exists public.instructor_test_progress (
  course_id uuid not null references public.courses(id) on delete cascade,
  instructor_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null,
  version_id uuid not null,
  completed_at timestamptz not null default now(),
  primary key (course_id,instructor_id,lesson_id,version_id),
  foreign key (course_id,version_id) references public.course_versions(course_id,id) on delete cascade
);
create index if not exists learner_progress_user_idx on public.learner_lesson_progress(learner_id,course_id);
alter table public.learner_lesson_progress enable row level security;
alter table public.instructor_test_progress enable row level security;
-- Prevent forged completions: only current published version, real lesson ID in snapshot, and enrollment/ownership.
create or replace function public.courselab_valid_progress(p_course uuid,p_version uuid,p_lesson uuid,p_test boolean)
returns boolean language sql stable security definer set search_path = '' as $body$
 select exists (
  select 1 from public.courses c
  join public.course_versions v on v.id=c.current_published_version_id and v.course_id=c.id
  where c.id=p_course and v.id=p_version
    and (case when p_test then c.owner_id=auth.uid()
          else exists(select 1 from public.course_enrollments e where e.course_id=c.id and e.learner_id=auth.uid()) end)
    and exists(select 1 from jsonb_array_elements(coalesce(v.snapshot->'lessons','[]'::jsonb)) l where l->>'id'=p_lesson::text)
 );
$body$;
revoke all on function public.courselab_valid_progress(uuid,uuid,uuid,boolean) from public,anon;
grant execute on function public.courselab_valid_progress(uuid,uuid,uuid,boolean) to authenticated;
drop policy if exists "Learner reads own progress" on public.learner_lesson_progress;
create policy "Learner reads own progress" on public.learner_lesson_progress for select to authenticated using (learner_id=(select auth.uid()));
drop policy if exists "Learner marks own current lesson" on public.learner_lesson_progress;
create policy "Learner marks own current lesson" on public.learner_lesson_progress for insert to authenticated
 with check (learner_id=(select auth.uid()) and public.courselab_valid_progress(course_id,version_id,lesson_id,false));
drop policy if exists "Instructor reads own test progress" on public.instructor_test_progress;
create policy "Instructor reads own test progress" on public.instructor_test_progress for select to authenticated using (instructor_id=(select auth.uid()) and exists(select 1 from public.courses c where c.id=course_id and c.owner_id=(select auth.uid())));
drop policy if exists "Instructor marks own test lesson" on public.instructor_test_progress;
create policy "Instructor marks own test lesson" on public.instructor_test_progress for insert to authenticated
 with check (instructor_id=(select auth.uid()) and public.courselab_valid_progress(course_id,version_id,lesson_id,true));
drop policy if exists "Instructor resets own test progress" on public.instructor_test_progress;
create policy "Instructor resets own test progress" on public.instructor_test_progress for delete to authenticated using (instructor_id=(select auth.uid()) and exists(select 1 from public.courses c where c.id=course_id and c.owner_id=(select auth.uid())));
-- Instructor reporting: never expose learner rows to other instructors. Test records explicitly labeled.
create or replace function public.courselab_course_gradebook(p_course uuid,p_include_test boolean default false)
returns table(learner_id uuid, learner_label text, is_test boolean, completed_lessons bigint, last_completed_at timestamptz)
language plpgsql stable security definer set search_path = '' as $body$
begin
 if not exists(select 1 from public.courses c where c.id=p_course and c.owner_id=auth.uid()) then
  raise exception 'Course not found or not owned';
 end if;
 return query
 select e.learner_id, 'Learner ' || left(e.learner_id::text,8), false,
   count(distinct lp.lesson_id)::bigint, max(lp.completed_at)
 from public.course_enrollments e
 left join public.courses c on c.id=e.course_id
 left join public.learner_lesson_progress lp on lp.course_id=e.course_id and lp.learner_id=e.learner_id and lp.version_id=c.current_published_version_id
 where e.course_id=p_course group by e.learner_id
 union all
 select auth.uid(), 'Test Student'::text, true,
   count(distinct tp.lesson_id)::bigint, max(tp.completed_at)
 from public.courses c
 left join public.instructor_test_progress tp on tp.course_id=c.id and tp.instructor_id=auth.uid() and tp.version_id=c.current_published_version_id
 where p_include_test and c.id=p_course
 group by c.id;
end;
$body$;
revoke all on function public.courselab_course_gradebook(uuid,boolean) from public,anon;
grant execute on function public.courselab_course_gradebook(uuid,boolean) to authenticated;
-- New Supabase tables need explicit Data API grants.
grant select,insert on public.learner_lesson_progress to authenticated;
grant select,insert,delete on public.instructor_test_progress to authenticated;
grant select,insert,update,delete on public.learner_lesson_progress,public.instructor_test_progress to service_role;
grant select on public.course_versions,public.course_enrollments to authenticated;
commit;
select table_name from information_schema.tables where table_schema='public' and table_name in ('learner_lesson_progress','instructor_test_progress') order by table_name;
