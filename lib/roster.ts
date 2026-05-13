// ============================================================
// 멤버 이름 ↔ 이메일 매핑 (UI 표시용)
//
// ⚠️ "누가 사이트에 들어올 수 있는가" 는 이 파일이 아니라
//    Supabase 의 `allowed_emails` 테이블이 결정합니다.
//    관리자가 Dashboard → Table Editor → allowed_emails 에서 직접 관리.
// ============================================================

export const ADMIN_EMAIL = 'david.admin@gmail.com';   // ← 관리자 Google 이메일

export const ROSTER: { name: string; email: string }[] = [
  { name: '김민태', email: 'mintae3827@kookmin.ac.kr' },
  { name: '류도현', email: 'rdh2993@gmail.com' },
  { name: '배준원', email: 'junwon020124@gmail.com' },
  { name: '김영제', email: 'youn704320@kookmin.ac.kr' },
  { name: '송영준', email: 'thddudwns307@gmail.com' },
  { name: '이영욱', email: 'iamlyg9667@gmail.com' },
  { name: '이원준', email: 'wj0103230806@gmail.com' },
  { name: '김찬중', email: 'chanjoongx@gmail.com' },
  { name: '장연승', email: 'changyeonseung@gmail.com' },
  { name: '백유빈', email: 'baek.eubin@gmail.com' },
  { name: '박유나', email: 'botw461@gmail.com' },
  { name: '송현주', email: 'thdguswn29@gmail.com' },
  { name: 'David',  email: ADMIN_EMAIL },
];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function nameFromEmail(email?: string | null): string {
  if (!email) return '';
  const hit = ROSTER.find((r) => r.email.toLowerCase() === email.toLowerCase());
  return hit?.name ?? email.split('@')[0];
}
