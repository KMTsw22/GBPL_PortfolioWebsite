// ============================================================
// 비공개 서클 — /private 페이지는 아래 4명만 볼 수 있음.
//   김민태 · 김찬중 · 배준원 · 박유나
//
// ⚠️ 이 목록은 UI/서버액션 가드용. DB(private_notes) 자체도
//    RLS 로 같은 4명 이메일에게만 읽기/쓰기를 허용합니다.
//    (supabase/private_circle.sql 참고)
// ============================================================

export const CIRCLE_EMAILS: string[] = [
  'mintae3827@kookmin.ac.kr', // 김민태
  'chanjoongx@gmail.com',     // 김찬중
  'junwon020124@gmail.com',   // 배준원
  'botw461@gmail.com',        // 박유나
].map((e) => e.toLowerCase());

export function isCircleMember(email?: string | null): boolean {
  if (!email) return false;
  return CIRCLE_EMAILS.includes(email.toLowerCase());
}
