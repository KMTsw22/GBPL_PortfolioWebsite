-- ============================================================
-- Storage buckets — avatars (사진), resumes (이력서 PDF/문서)
-- Run this AFTER schema.sql in: Supabase Dashboard → SQL editor
-- ============================================================

-- 1) 버킷 생성 (이미 있으면 무시) — 파일당 100MB 까지 허용
insert into storage.buckets (id, name, public, file_size_limit)
values ('avatars', 'avatars', true, 104857600)   -- 100 MiB
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
values ('resumes', 'resumes', true, 104857600)   -- 100 MiB
on conflict (id) do nothing;

-- 이미 만들어진 버킷이면 한도만 갱신
update storage.buckets set file_size_limit = 104857600 where id in ('avatars','resumes');

-- 2) 정책: 누구나 읽기 / 본인 폴더에만 쓰기
--    파일 경로 규칙: '<user_id>/<filename>' (첫 번째 폴더가 본인 uid)

-- ── avatars ────────────────────────────────────────────────
drop policy if exists "avatars_public_read"   on storage.objects;
drop policy if exists "avatars_owner_insert"  on storage.objects;
drop policy if exists "avatars_owner_update"  on storage.objects;
drop policy if exists "avatars_owner_delete"  on storage.objects;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── resumes ────────────────────────────────────────────────
drop policy if exists "resumes_public_read"   on storage.objects;
drop policy if exists "resumes_owner_insert"  on storage.objects;
drop policy if exists "resumes_owner_update"  on storage.objects;
drop policy if exists "resumes_owner_delete"  on storage.objects;

create policy "resumes_public_read"
  on storage.objects for select
  using (bucket_id = 'resumes');

create policy "resumes_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "resumes_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "resumes_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
