-- ============================================================
-- Team Portfolio — Supabase schema  (additive-only / idempotent)
-- Run this in: Supabase Dashboard → SQL editor → New query
--
-- 이 파일의 규칙:
--   1) 절대 DROP 하지 않음 — 테이블/컬럼/정책/트리거/함수 어떤 것도.
--   2) 모든 작업은 "없으면 만든다" 또는 "있으면 그대로 둔다" 형태.
--   3) 데이터 마이그레이션이 필요하면 UPDATE 까지만 — 옛 컬럼은 남겨둠.
--
-- 정책/트리거 내용을 "바꿔야" 한다면 schema.sql 을 또 돌리지 말고
-- Supabase Dashboard 에서 직접 수정하거나 별도 migration 파일을 만들 것.
-- ============================================================

-- ============================================================
-- 0) 화이트리스트 — 등록된 Google 이메일만 사이트에 들어올 수 있음
--    관리자: Supabase Dashboard → Table Editor → allowed_emails
-- ============================================================
create table if not exists public.allowed_emails (
  email      text primary key,
  note       text,
  added_at   timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;

-- 누구나(anon 포함) 읽기 가능 — 미들웨어/콜백에서 화이트리스트 조회용
-- 쓰기는 RLS 정책 없음 → service role(대시보드) 에서만 가능
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='allowed_emails'
      and policyname='allowed_emails_public_read'
  ) then
    create policy "allowed_emails_public_read"
      on public.allowed_emails for select
      to anon, authenticated
      using (true);
  end if;
end $$;

-- ============================================================
-- 1) members 테이블
-- ============================================================
create table if not exists public.members (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  name          text not null,
  role          text,
  bio           text,
  avatar_url    text,
  links         jsonb not null default '[]'::jsonb,
  theme         jsonb not null default '{}'::jsonb,
  tags          text[],
  updated_at    timestamptz not null default now()
);

-- 컬럼 추가는 안전 (없을 때만 추가)
alter table public.members add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.members add column if not exists theme jsonb not null default '{}'::jsonb;

-- (옛 고정 URL 컬럼들이 남아있더라도 DROP 하지 않음.
--  필요하면 손으로 정리하거나, 사용 안하면 그냥 둬도 무방.)

-- ============================================================
-- 2) RLS — 누구나(비로그인 포함) 조회, 자기 행만 편집
-- ============================================================
alter table public.members enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='members'
      and policyname='members_read_public'
  ) then
    create policy "members_read_public"
      on public.members for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='members'
      and policyname='members_insert_self'
  ) then
    create policy "members_insert_self"
      on public.members for insert
      to authenticated
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='members'
      and policyname='members_update_self'
  ) then
    create policy "members_update_self"
      on public.members for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

-- ============================================================
-- 3) 새 사용자가 auth.users 에 들어오면 자동으로 members 에 빈 행 생성
--    create or replace function 은 함수 본문만 갱신 (데이터/트리거 영향 X)
-- ============================================================
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

-- 트리거는 없을 때만 만든다 (있으면 그대로 둠 → DROP 안함)
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;

-- ============================================================
-- 4) 기존 사용자 backfill — 누락된 row 만 추가 (덮어쓰지 않음)
-- ============================================================
insert into public.members (id, email, name)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
from auth.users u
left join public.members m on m.id = u.id
where m.id is null;

-- ============================================================
-- 5) History 탭 — 사진 갤러리 + 댓글
--    누구나(비로그인 포함) 조회 가능, 작성/편집/삭제는 본인만.
-- ============================================================

create table if not exists public.gallery_posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references auth.users(id) on delete cascade,
  image_url  text not null,
  caption    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_posts_created_at_idx
  on public.gallery_posts (created_at desc);

alter table public.gallery_posts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='gallery_posts'
      and policyname='gallery_posts_read_public'
  ) then
    create policy "gallery_posts_read_public"
      on public.gallery_posts for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='gallery_posts'
      and policyname='gallery_posts_insert_self'
  ) then
    create policy "gallery_posts_insert_self"
      on public.gallery_posts for insert
      to authenticated
      with check (auth.uid() = author_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='gallery_posts'
      and policyname='gallery_posts_update_self'
  ) then
    create policy "gallery_posts_update_self"
      on public.gallery_posts for update
      to authenticated
      using (auth.uid() = author_id)
      with check (auth.uid() = author_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='gallery_posts'
      and policyname='gallery_posts_delete_self'
  ) then
    create policy "gallery_posts_delete_self"
      on public.gallery_posts for delete
      to authenticated
      using (auth.uid() = author_id);
  end if;
end $$;


create table if not exists public.gallery_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.gallery_posts(id) on delete cascade,
  author_id  uuid not null references auth.users(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists gallery_comments_post_id_idx
  on public.gallery_comments (post_id, created_at asc);

alter table public.gallery_comments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='gallery_comments'
      and policyname='gallery_comments_read_public'
  ) then
    create policy "gallery_comments_read_public"
      on public.gallery_comments for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='gallery_comments'
      and policyname='gallery_comments_insert_self'
  ) then
    create policy "gallery_comments_insert_self"
      on public.gallery_comments for insert
      to authenticated
      with check (auth.uid() = author_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='gallery_comments'
      and policyname='gallery_comments_delete_self'
  ) then
    create policy "gallery_comments_delete_self"
      on public.gallery_comments for delete
      to authenticated
      using (auth.uid() = author_id);
  end if;
end $$;


-- ============================================================
-- 6) (선택) 화이트리스트 시드 — 이미 있는 이메일은 건너뜀
--    실 운영에선 Dashboard 에서 직접 관리하는 게 편함.
-- ============================================================
insert into public.allowed_emails (email, note) values
  ('mintae3827@kookmin.ac.kr', '김민태'),
  ('rdh2993@gmail.com',        '류도현'),
  ('junwon020124@gmail.com',   '배준원'),
  ('youn704320@kookmin.ac.kr', '김영제'),
  ('thddudwns307@gmail.com',   '송영준'),
  ('iamlyg9667@gmail.com',     '이영욱'),
  ('wj0103230806@gmail.com',   '이원준'),
  ('chanjoongx@gmail.com',     '김찬중'),
  ('changyeonseung@gmail.com', '장연승'),
  ('baek.eubin@gmail.com',     '백유빈'),
  ('botw461@gmail.com',        '박유나'),
  ('thdguswn29@gmail.com',     '송현주'),
  ('david.admin@gmail.com',    'David (관리자)')
on conflict (email) do nothing;
