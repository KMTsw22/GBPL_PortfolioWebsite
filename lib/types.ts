export type LinkKind = 'link' | 'file';

export type LinkItem = {
  label: string;
  url: string;
  kind: LinkKind;
  pinned?: boolean;
  icon?: string;   // 비어있으면 'auto' — URL 도메인 기반 자동 감지
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

// History 탭 — 사진 갤러리
export type GalleryPost = {
  id: string;
  author_id: string;
  image_url: string;
  caption: string | null;
  event_date: string | null;    // YYYY-MM-DD — 사진 속 일이 있었던 날 (선택)
  created_at: string;
  updated_at: string;
  // 조회 시 조인으로 채워짐 (DB 컬럼 X)
  author_email?: string;
  author_name?: string;
  author_avatar?: string | null;
  comments?: GalleryComment[];
};

export type GalleryComment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author_email?: string;
  author_name?: string;
};

// Calendar 탭 — 매주 고정 수업 (DB: weekly_classes)
export type WeeklyClass = {
  id: string;                // 'mon-startup' 같은 슬러그
  title: string;
  day_of_week: number;       // 0=일, 1=월, ... 6=토
  start_minutes: number;     // 자정 기준 분
  end_minutes: number;
  location: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
};

// Calendar 탭 — 사용자 추가 일정
export type ClassEvent = {
  id: string;
  author_id: string;
  title: string;
  location: string | null;
  description: string | null;
  starts_at: string;            // ISO timestamptz
  ends_at: string | null;       // ISO timestamptz (선택)
  all_day: boolean;
  color: string | null;         // #hex (선택)
  created_at: string;
  updated_at: string;
  // 조회 시 조인으로 채워짐 (DB 컬럼 X)
  author_email?: string;
  author_name?: string;
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
