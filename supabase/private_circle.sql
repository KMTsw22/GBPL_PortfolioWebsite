-- ============================================================
-- 비공개 서클 게시판 — private_notes
--   /private 페이지 전용. 아래 4명만 읽기/쓰기 가능:
--     김민태  mintae3827@kookmin.ac.kr
--     김찬중  chanjoongx@gmail.com
--     배준원  junwon020124@gmail.com
--     박유나  botw461@gmail.com
--
-- Run this in: Supabase Dashboard → SQL editor → New query
-- 규칙은 schema.sql 과 동일: 절대 DROP 하지 않고, 없을 때만 만든다.
--
-- 다른 테이블은 "누구나 읽기"였지만, 이 테이블은 RLS 로
-- 위 4명의 이메일에게만 select/insert/delete 를 허용합니다.
-- (미들웨어/페이지 가드에 더해 DB 레벨에서도 한 번 더 차단)
-- ============================================================

create table if not exists public.private_notes (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references auth.users(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists private_notes_created_at_idx
  on public.private_notes (created_at desc);

alter table public.private_notes enable row level security;

-- 서클 이메일 판별 헬퍼 (JWT 의 email 클레임 기준)
create or replace function public.is_circle_member()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = any (array[
    'mintae3827@kookmin.ac.kr',
    'chanjoongx@gmail.com',
    'junwon020124@gmail.com',
    'botw461@gmail.com'
  ]);
$$;

do $$
begin
  -- 서클 멤버만 조회 가능
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='private_notes'
      and policyname='private_notes_circle_read'
  ) then
    create policy "private_notes_circle_read"
      on public.private_notes for select
      to authenticated
      using (public.is_circle_member());
  end if;

  -- 서클 멤버만, 본인 글로만 작성 가능
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='private_notes'
      and policyname='private_notes_circle_insert'
  ) then
    create policy "private_notes_circle_insert"
      on public.private_notes for insert
      to authenticated
      with check (public.is_circle_member() and auth.uid() = author_id);
  end if;

  -- 본인 글만 삭제 가능 (서클 멤버 한정)
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='private_notes'
      and policyname='private_notes_circle_delete'
  ) then
    create policy "private_notes_circle_delete"
      on public.private_notes for delete
      to authenticated
      using (public.is_circle_member() and auth.uid() = author_id);
  end if;
end $$;
