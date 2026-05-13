# Team Portfolio

12명 멤버 + 관리자(David) 전용 포트폴리오 사이트.  
**Next.js 15 (App Router) + Tailwind + Supabase** 로 만들고, **Vercel** 에 배포합니다.

## 멤버 (12명)

김민태, 류도현, 배준원, 김영제, 송영준, 이영욱, 이원준, 김찬중, 장연승, 백유빈, 박유나, 송현주

관리자: **David**

## 로그인 정보 (임시)

이름 + 비밀번호로 로그인합니다. (이메일 입력 안 함)

| 이름 | 비밀번호 |
|---|---|
| 김민태, 류도현, 배준원, 김영제, 송영준, 이영욱, 이원준, 김찬중, 장연승, 백유빈, 박유나, 송현주 | `1234` |
| David (관리자) | `1234` |

> 첫 로그인 후 우측 상단 **비밀번호 변경** 에서 각자 비번을 바꿀 수 있어요.

---

## 1) 로컬 실행

```bash
npm install
copy .env.local.example .env.local   # mac/linux: cp ...
# .env.local 에 Supabase 값 채우기
npm run dev
```

브라우저: http://localhost:3000 → 로그인 페이지로 리다이렉트.

---

## 2) Supabase 세팅

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성.
2. **Project Settings → API** 의 두 값을 `.env.local` 에 복사:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Authentication → Policies → Password requirements** 에서  
   `Minimum password length` 를 **4** 로 낮춥니다. (임시 비밀번호 `1234` 때문)
4. **SQL Editor → New query** 에서 다음을 **순서대로** 실행:
   - [`supabase/schema.sql`](supabase/schema.sql) — 테이블 + RLS + 트리거
   - [`supabase/storage.sql`](supabase/storage.sql) — 사진 / 파일 버킷 + 정책
   - [`supabase/seed_users.sql`](supabase/seed_users.sql) — 12명 + David 계정 일괄 생성

> 운영 시작 전엔 비밀번호를 강하게 바꾸고, 비밀번호 최소 길이도 다시 8 이상으로 올려주세요.

---

## 3) Vercel 배포

1. 이 폴더를 GitHub에 push.
2. [vercel.com/new](https://vercel.com/new) → 해당 레포 import.
3. **Environment Variables** 에 두 개 등록:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

---

## 4) 페이지

| 경로 | 설명 |
|---|---|
| `/login` | 이름 + 비밀번호 로그인 |
| `/` | 멤버 12명 카드 그리드 (David 는 안 보임) |
| `/members/[id]` | 멤버 상세 페이지 — Resume / Portfolio / LinkedIn / GitHub 링크 |
| `/profile` | 본인 프로필 편집 — 사진/파일 드래그업로드, 링크 자유 추가, 카드에 보일 항목 ⭐ 로 토글 |
| `/account` | 비밀번호 변경 |

David 계정은 별도의 관리 화면이 없어요. 멤버 데이터를 직접 손보고 싶으면 Supabase 대시보드의 Table Editor 를 쓰세요.

---

## 5) 구조

```
app/
  layout.tsx
  globals.css
  page.tsx                 # 멤버 그리드 (보호됨)
  login/                   # /login + signIn / signOut 액션
    page.tsx
    actions.ts
  members/[id]/page.tsx    # 멤버 상세
  profile/                 # 내 프로필 편집
    page.tsx
    actions.ts
  account/                 # 비밀번호 변경
    page.tsx
    actions.ts
components/
  Header.tsx
  Avatar.tsx
  MemberCard.tsx
  LinkButtons.tsx
  MemberFormFields.tsx
lib/
  types.ts
  roster.ts                # 이름 ↔ 이메일 매핑 (single source of truth)
  supabase/
    client.ts              # 브라우저용
    server.ts              # 서버 컴포넌트/액션용
    middleware.ts          # 세션 새로고침
middleware.ts              # /login 외 모든 경로 인증 게이트
supabase/
  schema.sql               # members 테이블 + RLS + 트리거
  seed_users.sql           # 12명 + David 시드
```

---

## 6) 멤버 추가/삭제 / 이름 바꾸기

`lib/roster.ts` 한 곳에 이름과 이메일이 묶여 있습니다.  
새 멤버를 추가하려면 ROSTER 배열에 한 줄 더 추가하고, `supabase/seed_users.sql` 의 `members` 배열에도 같은 항목을 추가한 뒤 SQL 을 다시 실행하세요.

---

## 7) 정리

이전에 만든 `index.html`, `styles.css` 는 Next.js와 무관하니 **수동으로 지워주세요.**
