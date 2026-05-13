-- ============================================================
-- 일회성 정리 — 옛 이메일/비밀번호 시드(seed_users.sql) 잔재 청소
--
-- 배경:
--   이전 버전에서 12명을 `*@team.local` 이메일로 일괄 생성하는 시드를
--   썼습니다. 지금은 Google OAuth 로 전환했고, 그 유령 계정들이
--   auth.users / members 에 그대로 남아 있어요.
--
-- 무엇을 하나:
--   1) auth.users 에서 `%@team.local` 이메일 계정 삭제
--      → members 는 FK on delete cascade 라 자동으로 같이 삭제됨
--   2) allowed_emails 에 현재 roster 의 실제 이메일을 보강 (없는 것만 추가)
--
-- 어떻게:
--   Supabase Dashboard → SQL editor → New query 에 붙여넣고 Run.
--   한 번만 돌리면 됨. schema.sql 과 달리 1) 은 DELETE — 의도된 정리.
--
-- 안전 장치:
--   • `@team.local` 이메일만 대상 — 진짜 이메일은 절대 안 건드림
--   • DRY RUN 으로 미리 확인 가능 (아래 2-A 블록)
-- ============================================================

-- ------------------------------------------------------------
-- 2-A) DRY RUN — 진짜 지우기 전에 어떤 계정이 사라질지 먼저 확인
--      이 블록만 따로 실행해서 결과 확인 후, 아래 실제 DELETE 진행.
-- ------------------------------------------------------------
select id, email, created_at
from auth.users
where email like '%@team.local'
order by email;

-- ------------------------------------------------------------
-- 2-B) 실제 정리 — 위 결과가 예상과 같으면 여기서 아래만 실행
-- ------------------------------------------------------------

-- 1) auth.users 에서 @team.local 유령 계정 삭제 → members 도 CASCADE 로 같이 삭제
delete from auth.users
where email like '%@team.local';

-- 2) allowed_emails 보강 — 현재 roster 의 진짜 이메일 (있으면 건너뜀)
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

-- ------------------------------------------------------------
-- 3) 확인 — 정리 후 현재 상태
-- ------------------------------------------------------------
select 'auth.users' as table_name, count(*) as rows from auth.users
union all
select 'public.members', count(*) from public.members
union all
select 'public.allowed_emails', count(*) from public.allowed_emails;

-- 멤버 목록 미리보기
select m.email, m.name
from public.members m
order by m.name;
