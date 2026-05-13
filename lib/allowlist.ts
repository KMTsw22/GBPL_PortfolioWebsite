// ============================================================
// 화이트리스트 — Supabase `allowed_emails` 테이블에 등록된
// Google 이메일만 사이트에 들어올 수 있습니다.
// 관리자는 Supabase Dashboard → Table Editor → allowed_emails
// 에서 이메일을 추가/삭제하기만 하면 됩니다 (재배포 X).
// ============================================================

import { createServerClient } from '@supabase/ssr';

type Reader = {
  fetchAllowedEmails: () => Promise<string[]>;
};

// 인증 필요 없는 단순 조회용 클라이언트 (쿠키 처리 X)
function makeReader(): Reader {
  return {
    async fetchAllowedEmails() {
      const client = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } },
      );
      const { data, error } = await client.from('allowed_emails').select('email');
      if (error || !data) return [];
      return data.map((r) => String(r.email).toLowerCase());
    },
  };
}

const reader = makeReader();

export async function getAllowedEmails(): Promise<string[]> {
  return reader.fetchAllowedEmails();
}

export async function isAllowed(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const list = await reader.fetchAllowedEmails();
  return list.includes(email.toLowerCase());
}
