export type LinkKind = 'link' | 'file';

export type LinkItem = {
  label: string;
  url: string;
  kind: LinkKind;
  pinned?: boolean;
};

export type CardTheme = {
  bgColor?: string;       // 카드 본문 배경색 (#hex)
  bgImage?: string;       // 카드 상단 배너 이미지 URL
  accentColor?: string;   // 강조색 (이름 위 라인 등)
};

export type Member = {
  id: string;
  email: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  links: LinkItem[];
  tags: string[] | null;
  theme: CardTheme | null;
  updated_at: string;
};

// 사용자가 "www.linkedin.com/..." 처럼 프로토콜 없이 적어도 절대 URL 로 보정.
// (없으면 브라우저가 상대 경로로 해석해서 우리 도메인 뒤에 붙어버림 → 404)
// file: 같은 안전한 스킴은 통과시키고, javascript: 같은 위험 스킴은 차단.
export function normalizeUrl(raw?: string | null): string {
  const s = (raw ?? '').trim();
  if (!s) return '';
  if (/^javascript:/i.test(s)) return '';
  if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
  // Supabase storage 등에서 받은 절대 경로(/...) 는 그대로 둠
  if (s.startsWith('/')) return s;
  return `https://${s.replace(/^\/+/, '')}`;
}

// 배경색 위에 읽기 좋은 텍스트 색을 자동 계산
export function readableText(bg?: string | null): string {
  if (!bg || !/^#?[0-9a-f]{6}$/i.test(bg.replace('#', ''))) return '';
  const hex = bg.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1a1a1a' : '#ffffff';
}
