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
