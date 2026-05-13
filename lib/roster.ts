export const ADMIN_EMAIL = 'admin@team.local';

export const ROSTER: { name: string; email: string }[] = [
  { name: '김민태', email: 'mintae@team.local' },
  { name: '류도현', email: 'dohyeon@team.local' },
  { name: '배준원', email: 'junwon@team.local' },
  { name: '김영제', email: 'youngje@team.local' },
  { name: '송영준', email: 'youngjun@team.local' },
  { name: '이영욱', email: 'youngwook@team.local' },
  { name: '이원준', email: 'wonjun@team.local' },
  { name: '김찬중', email: 'chanjoong@team.local' },
  { name: '장연승', email: 'yeonseung@team.local' },
  { name: '백유빈', email: 'yubin@team.local' },
  { name: '박유나', email: 'yuna@team.local' },
  { name: '송현주', email: 'hyunju@team.local' },
  { name: 'David',  email: ADMIN_EMAIL },
];

export function emailFromName(name: string): string | null {
  const n = name.trim();
  const hit = ROSTER.find((r) => r.name === n);
  return hit?.email ?? null;
}

export function isAdminEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function nameFromEmail(email?: string | null): string {
  if (!email) return '';
  const hit = ROSTER.find((r) => r.email.toLowerCase() === email.toLowerCase());
  return hit?.name ?? email.split('@')[0];
}
