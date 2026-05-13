# Team Portfolio

12명 멤버 + 관리자(David) 전용 포트폴리오 사이트.  
**Next.js 15 (App Router) + Tailwind + Supabase (Google OAuth)** 로 만들고, **Vercel** 에 배포합니다.

## 멤버 (12명)

김민태, 류도현, 배준원, 김영제, 송영준, 이영욱, 이원준, 김찬중, 장연승, 백유빈, 박유나, 송현주

관리자: **David**

## 로그인 방식

이메일/비번 없음. **Google 계정으로 로그인** 하고, **Supabase 의 `allowed_emails` 테이블에 등록된 Gmail 만** 들어올 수 있어요.

---

## 1) Supabase 세팅

### 1-1. 프로젝트 만들기

[supabase.com](https://supabase.com) 에서 새 프로젝트 생성.

### 1-2. SQL 실행 (순서대로)

**SQL Editor → New query** 에서:
1. [`supabase/schema.sql`](supabase/schema.sql) — 테이블 + RLS + 트리거 + `allowed_emails` 시드
2. [`supabase/storage.sql`](supabase/storage.sql) — 사진 / 파일 버킷 + 정책 (각 100MB 까지)

### 1-3. Google OAuth 활성화

1. [Google Cloud Console](https://console.cloud.google.com/) → 새 프로젝트 → **APIs & Services → Credentials**
2. **Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:  
     `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. 발급된 **Client ID / Client Secret** 복사
4. Supabase Dashboard → **Authentication → Providers → Google** → Enable, Client ID/Secret 붙여넣기 → Save
5. **Authentication → URL Configuration**:
   - Site URL: `https://your-domain.vercel.app` (배포 후 추가)
   - Redirect URLs: `https://your-domain.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`

### 1-4. 화이트리스트 (누가 들어올 수 있는가)

**Dashboard → Table Editor → `allowed_emails`** 에서 직접 관리:
- 새 멤버 추가 → **Insert row** → 이메일 + 메모 입력
- 제거 → 해당 행 삭제

`schema.sql` 실행 시 placeholder 12명이 시드되지만, 실제 Gmail 받는 대로 행을 업데이트하세요.

> 이미 등록한 사람을 빼면, 그 사람의 기존 세션은 즉시는 안 끊김. 완전 차단하려면 **Authentication → Users** 에서 해당 사용자 ⋯ → "Sign out" 도 눌러주세요.

---

## 2) 로컬 실행

```bash
npm install
copy .env.local.example .env.local
# .env.local 에 Supabase 값 채우기
npm run dev
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

브라우저: http://localhost:3000 → 로그인 → "Google 계정으로 로그인" 클릭.

---

## 3) Vercel 배포

1. GitHub 에 push
2. [vercel.com/new](https://vercel.com/new) → 레포 import
3. **Environment Variables** 등록:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.vercel.app`
4. Deploy
5. 배포 후 Supabase **Authentication → URL Configuration** 의 Site URL / Redirect URLs 에 Vercel 도메인 추가

---

## 4) 페이지

| 경로 | 설명 |
|---|---|
| `/login` | Google 로그인 버튼 1개 |
| `/auth/callback` | Google 인증 후 화이트리스트 검증 |
| `/` | 멤버 12명 카드 그리드 (David 는 안 보임) |
| `/members/[id]` | 멤버 상세 |
| `/profile` | 본인 프로필 편집 — 사진/파일 드래그업로드, 링크 자유 추가, ⭐ 토글, 카드 색상/배너 |

David 계정은 별도 어드민 화면 없음. 데이터 직접 손볼 땐 Supabase Table Editor 사용.

---

## 5) 새 멤버 추가 흐름

1. 신규 멤버 → 본인 Gmail 알려줌
2. 관리자 → Supabase Dashboard → **Table Editor → allowed_emails → Insert** 로 이메일 추가
3. 신규 멤버 → 사이트에서 "Google 계정으로 로그인" 클릭 → 자동으로 계정 생성됨
4. `/profile` 에서 본인 프로필 입력

코드 수정/재배포 필요 없음.

> 참고: `lib/roster.ts` 에는 멤버 한국어 이름 ↔ Gmail 매핑이 들어있어요 (헤더에 "김민태 · 로그아웃" 같이 한글로 보여주기 위함). 새 멤버를 추가할 땐 [lib/roster.ts](lib/roster.ts) 에도 한 줄 넣어 push 하면 한글 이름이 표시돼요. 안 넣어도 로그인은 됨 (이메일 앞부분이 표시).

---

## 6) 구조

```
app/
  layout.tsx
  globals.css
  page.tsx                 # 멤버 그리드 (보호됨)
  login/                   # /login + signInWithGoogle / signOut 액션
    page.tsx
    actions.ts
  auth/callback/route.ts   # Google OAuth 콜백 + 화이트리스트 검증
  members/[id]/page.tsx    # 멤버 상세
  profile/                 # 내 프로필 편집
    page.tsx
    actions.ts
  account/page.tsx         # /profile 로 리다이렉트 (구글이 비번 관리)
components/
  Header.tsx
  Avatar.tsx               AvatarUploader.tsx
  MemberCard.tsx           LinkButtons.tsx
  ProfileEditor.tsx        ThemeEditor.tsx
  FileUploader.tsx         LinksEditor.tsx
lib/
  types.ts                 # Member, LinkItem, CardTheme
  roster.ts                # 이름 ↔ 이메일 매핑 (UI 표시용)
  allowlist.ts             # allowed_emails 테이블 조회 헬퍼
  supabase/
    client.ts server.ts middleware.ts
middleware.ts              # 인증 + 화이트리스트 게이트
supabase/
  schema.sql               # members + allowed_emails + RLS + 트리거
  storage.sql              # avatars / resumes 버킷 + 정책
  seed_users.sql           # ⚠️ 더 이상 안 씀 (옛 이메일/비번 로그인용)
```
