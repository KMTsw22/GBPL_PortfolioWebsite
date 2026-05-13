-- ============================================================
-- 12명 + 관리자 1명 계정 일괄 생성
-- (Supabase Dashboard → SQL editor 에서 실행)
--
-- 멤버 12명: 김민태, 류도현, 배준원, 김영제, 송영준, 이영욱,
--           이원준, 김찬중, 장연승, 백유빈, 박유나, 송현주
-- 관리자  : 이름 'David', 이메일 admin@team.local
--
-- ⚠️ 비밀번호 1234는 4자라서 Supabase 기본 정책(6자 이상)에 걸립니다.
--    Dashboard → Authentication → Policies → Password requirements 에서
--    Minimum password length 를 4 이하로 낮춘 뒤 이 스크립트를 실행하세요.
--    (운영 시작 전엔 다시 강한 정책으로 되돌리는 걸 권장합니다.)
-- ============================================================

do $$
declare
  members text[][] := array[
    -- ['email', 'name']
    ['mintae@team.local',   '김민태'],
    ['dohyeon@team.local',  '류도현'],
    ['junwon@team.local',   '배준원'],
    ['youngje@team.local',  '김영제'],
    ['youngjun@team.local', '송영준'],
    ['youngwook@team.local','이영욱'],
    ['wonjun@team.local',   '이원준'],
    ['chanjoong@team.local','김찬중'],
    ['yeonseung@team.local','장연승'],
    ['yubin@team.local',    '백유빈'],
    ['yuna@team.local',     '박유나'],
    ['hyunju@team.local',   '송현주'],
    ['admin@team.local',    'David']
  ];
  shared_password text := '1234';   -- 임시 비밀번호. 운영 전엔 꼭 바꿔주세요!
  i int;
  uid uuid;
begin
  for i in 1..array_length(members, 1) loop
    if not exists (select 1 from auth.users where email = members[i][1]) then
      uid := gen_random_uuid();
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, recovery_token,
        email_change_token_new, email_change
      )
      values (
        uid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        members[i][1],
        crypt(shared_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('name', members[i][2]),
        now(), now(), '', '', '', ''
      );

      -- 트리거가 members 행을 자동 생성하지만, 안전망으로 한 번 더 보장
      insert into public.members (id, email, name)
      values (uid, members[i][1], members[i][2])
      on conflict (id) do nothing;
    end if;
  end loop;
end $$;
