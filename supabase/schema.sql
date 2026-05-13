-- ============================================================
-- Team Portfolio — Supabase schema
-- Run this in: Supabase Dashboard → SQL editor → New query
-- (재실행 안전 — 이미 만든 게 있어도 에러 없이 진행됩니다)
-- ============================================================

-- 0) 화이트리스트 — 여기에 이메일이 등록된 Google 계정만 사이트에 들어올 수 있음
--    관리자: Supabase Dashboard → Table Editor → allowed_emails 에서 추가/삭제
create table if not exists public.allowed_emails (
  email      text primary key,
  note       text,                                 -- 누구인지 메모용 (선택)
  added_at   timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;

-- 누구나 (anon 포함) 읽기 가능 — 미들웨어/콜백에서 화이트리스트 조회용
drop policy if exists "allowed_emails_public_read" on public.allowed_emails;
create policy "allowed_emails_public_read"
  on public.allowed_emails for select
  to anon, authenticated
  using (true);

-- 쓰기는 막음 — Service role (대시보드) 에서만 INSERT/UPDATE/DELETE
-- (RLS 정책이 없으면 일반 인증사용자는 쓸 수 없음)

-- 1) members 테이블
create table if not exists public.members (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  name          text not null,
  role          text,
  bio           text,
  avatar_url    text,
  links         jsonb not null default '[]'::jsonb,   -- [{label, url, kind, pinned}]
  theme         jsonb not null default '{}'::jsonb,   -- {bgColor, bgImage, accentColor}
  tags          text[],
  updated_at    timestamptz not null default now()
);

-- 1-a) 마이그레이션: 옛 컬럼들 → links jsonb 통합 + theme 컬럼 추가
alter table public.members add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.members add column if not exists theme jsonb not null default '{}'::jsonb;

do $$
begin
  -- LinkedIn / GitHub / Portfolio / Website (옛 고정 컬럼)
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='members' and column_name='linkedin_url'
  ) then
    update public.members
       set links = coalesce(links, '[]'::jsonb)
                 || case when linkedin_url  is not null then jsonb_build_array(jsonb_build_object('label','LinkedIn',  'url', linkedin_url,  'kind','link','pinned', true)) else '[]'::jsonb end
                 || case when github_url    is not null then jsonb_build_array(jsonb_build_object('label','GitHub',    'url', github_url,    'kind','link','pinned', true)) else '[]'::jsonb end
                 || case when portfolio_url is not null then jsonb_build_array(jsonb_build_object('label','Portfolio', 'url', portfolio_url, 'kind','link','pinned', true)) else '[]'::jsonb end
                 || case when website_url   is not null then jsonb_build_array(jsonb_build_object('label','Website',   'url', website_url,   'kind','link','pinned', true)) else '[]'::jsonb end;
    alter table public.members drop column if exists linkedin_url;
    alter table public.members drop column if exists github_url;
    alter table public.members drop column if exists portfolio_url;
    alter table public.members drop column if exists website_url;
  end if;

  -- Resume (옛 고정 컬럼) → links 의 file 항목으로
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='members' and column_name='resume_url'
  ) then
    update public.members
       set links = coalesce(links, '[]'::jsonb)
                 || case when resume_url is not null then jsonb_build_array(jsonb_build_object('label','Resume', 'url', resume_url, 'kind','file','pinned', true)) else '[]'::jsonb end;
    alter table public.members drop column if exists resume_url;
  end if;
end $$;

-- 2) RLS — 누구나 조회, 자기 행만 편집
alter table public.members enable row level security;

drop policy if exists "members_read_authenticated" on public.members;
create policy "members_read_authenticated"
  on public.members for select
  to authenticated
  using (true);

drop policy if exists "members_insert_self" on public.members;
create policy "members_insert_self"
  on public.members for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "members_update_self" on public.members;
create policy "members_update_self"
  on public.members for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- (이전 버전에서 만들어졌을 수 있는 정책/함수 정리)
drop policy if exists "members_insert_self_or_admin" on public.members;
drop policy if exists "members_update_self_or_admin" on public.members;
drop policy if exists "members_delete_admin" on public.members;
drop function if exists public.is_admin();

-- 3) 새 사용자가 auth.users 에 들어오면 자동으로 members 에 빈 행 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) 기존 사용자 backfill
insert into public.members (id, email, name)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
from auth.users u
left join public.members m on m.id = u.id
where m.id is null;

-- 5) (선택) 화이트리스트에 13명 시드 — 이메일은 실제 Google 이메일로 바꿔서 다시 실행하세요
--    이미 있는 이메일은 건너뜀. 실제 사용 전엔 dashboard 에서 직접 관리하는 게 편합니다.
insert into public.allowed_emails (email, note) values
  ('mintae3827@kookmin.ac.kr', '김민태'),
  ('dohyeon@gmail.com',  '류도현'),
  ('junwon@gmail.com',   '배준원'),
  ('youngje@gmail.com',  '김영제'),
  ('youngjun@gmail.com', '송영준'),
  ('youngwook@gmail.com','이영욱'),
  ('wonjun@gmail.com',   '이원준'),
  ('chanjoong@gmail.com','김찬중'),
  ('yeonseung@gmail.com','장연승'),
  ('yubin@gmail.com',    '백유빈'),
  ('yuna@gmail.com',     '박유나'),
  ('hyunju@gmail.com',   '송현주'),
  ('david.admin@gmail.com', 'David (관리자)')
on conflict (email) do nothing;
