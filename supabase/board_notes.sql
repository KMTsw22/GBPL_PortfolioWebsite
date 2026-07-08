-- ============================================================
-- 공개 게시판 — private_notes
--   /private 페이지. 누구나(비로그인 포함) 조회 가능.
--   작성/삭제는 로그인한 본인만 (다른 탭과 동일).
--
-- Run this in: Supabase Dashboard → SQL editor → New query
-- (앞서 "4인 전용" 버전을 이미 돌렸다면, 아래가 그 정책을 덮어써서
--  공개 읽기로 바꿉니다. 여러 번 돌려도 안전.)
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

-- (구) 4인 전용 정책이 있으면 제거 — 공개 읽기로 전환
drop policy if exists "private_notes_circle_read"   on public.private_notes;
drop policy if exists "private_notes_circle_insert" on public.private_notes;
drop policy if exists "private_notes_circle_delete" on public.private_notes;
drop function if exists public.is_circle_member();

do $$
begin
  -- 누구나(anon 포함) 조회 가능
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='private_notes'
      and policyname='private_notes_read_public'
  ) then
    create policy "private_notes_read_public"
      on public.private_notes for select
      to anon, authenticated
      using (true);
  end if;

  -- 작성은 로그인한 본인 글만
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='private_notes'
      and policyname='private_notes_insert_self'
  ) then
    create policy "private_notes_insert_self"
      on public.private_notes for insert
      to authenticated
      with check (auth.uid() = author_id);
  end if;

  -- 삭제도 본인 글만
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='private_notes'
      and policyname='private_notes_delete_self'
  ) then
    create policy "private_notes_delete_self"
      on public.private_notes for delete
      to authenticated
      using (auth.uid() = author_id);
  end if;
end $$;
