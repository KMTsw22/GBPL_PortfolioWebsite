import type { LinkItem } from './types';

export type IconId =
  | 'auto'
  | 'link'
  | 'file'
  | 'pdf'
  | 'image'
  | 'mail'
  | 'github'
  | 'linkedin'
  | 'notion'
  | 'youtube'
  | 'instagram'
  | 'behance'
  | 'figma';

export const ICON_OPTIONS: { id: IconId; label: string }[] = [
  { id: 'auto', label: '자동' },
  { id: 'link', label: '링크' },
  { id: 'file', label: '파일' },
  { id: 'pdf', label: 'PDF' },
  { id: 'image', label: '이미지' },
  { id: 'mail', label: '이메일' },
  { id: 'github', label: 'GitHub' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'notion', label: 'Notion' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'behance', label: 'Behance' },
  { id: 'figma', label: 'Figma' },
];

function detect(it: LinkItem): IconId {
  const u = (it.url ?? '').toLowerCase();
  if (it.kind === 'file') {
    if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/.test(u)) return 'image';
    if (/\.pdf(\?|#|$)/.test(u)) return 'pdf';
    return 'file';
  }
  if (u.startsWith('mailto:')) return 'mail';
  if (u.includes('github.com')) return 'github';
  if (u.includes('linkedin.com')) return 'linkedin';
  if (u.includes('notion.so') || u.includes('notion.site')) return 'notion';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('behance.net')) return 'behance';
  if (u.includes('figma.com')) return 'figma';
  return 'link';
}

export function effectiveIconId(it: LinkItem): IconId {
  const explicit = (it.icon as IconId | undefined) ?? 'auto';
  return explicit === 'auto' ? detect(it) : explicit;
}

type GlyphProps = { id: IconId; className?: string };

export function LinkIcon({
  item,
  iconId,
  className,
}: {
  item?: LinkItem;
  iconId?: IconId;
  className?: string;
}) {
  const id: IconId = iconId ?? (item ? effectiveIconId(item) : 'link');
  return <Glyph id={id} className={className} />;
}

function Glyph({ id, className }: GlyphProps) {
  const cls = className ?? 'h-3.5 w-3.5';
  switch (id) {
    case 'auto':
      // 자동 모드는 detect 후 다른 case 로 넘어가지만, 직접 표시될 때(편집기에서 'auto' 선택지) 일반 링크 아이콘으로 그림
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3v3M21 12h-3M12 21v-3M3 12h3M5.6 5.6l2.1 2.1M18.4 5.6l-2.1 2.1M18.4 18.4l-2.1-2.1M5.6 18.4l2.1-2.1" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="#181717" aria-hidden>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57v-2.13c-3.345.72-4.05-1.605-4.05-1.605-.54-1.395-1.335-1.755-1.335-1.755-1.095-.75.075-.735.075-.735 1.215.09 1.86 1.245 1.86 1.245 1.08 1.845 2.835 1.32 3.525 1.005.105-.78.42-1.32.765-1.62-2.67-.3-5.475-1.335-5.475-5.94 0-1.32.465-2.4 1.245-3.24-.12-.3-.54-1.53.105-3.18 0 0 1.02-.33 3.345 1.245.975-.27 2.01-.405 3.045-.405s2.07.135 3.045.405c2.31-1.575 3.33-1.245 3.33-1.245.66 1.65.24 2.88.12 3.18.78.84 1.245 1.92 1.245 3.24 0 4.62-2.805 5.625-5.475 5.925.42.375.81 1.095.81 2.22v3.285c0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="#0A66C2" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      );
    case 'notion':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="#000000" aria-hidden>
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.027.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747L1.354 19.36c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.375-1.632z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="#FF0000" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
          <path fill="#ffffff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <defs>
            <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#FFDC80" />
              <stop offset="0.25" stopColor="#FCAF45" />
              <stop offset="0.5" stopColor="#F77737" />
              <stop offset="0.7" stopColor="#E1306C" />
              <stop offset="0.9" stopColor="#833AB4" />
              <stop offset="1" stopColor="#405DE6" />
            </linearGradient>
          </defs>
          <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case 'behance':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="#1769FF" aria-hidden>
          <path d="M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.39c-.011-.764.124-1.522.4-2.234a5.247 5.247 0 0 1 5.198-3.422 4.804 4.804 0 0 1 2.296.514c.65.347 1.219.823 1.671 1.4a5.852 5.852 0 0 1 .945 2.005c.194.778.264 1.583.205 2.383h-7.672c-.118.776.157 1.557.722 2.075v-.001zM6.947 4.084c.611-.003 1.221.05 1.823.16.51.085 1 .269 1.439.538.413.263.747.629.97 1.063.246.529.364 1.111.343 1.694.025.652-.155 1.298-.513 1.844-.394.532-.917.954-1.518 1.224.823.2 1.55.679 2.054 1.355a4.124 4.124 0 0 1 .689 2.412c.011.644-.124 1.281-.394 1.864a3.78 3.78 0 0 1-1.086 1.331c-.479.358-1.02.624-1.596.785a6.732 6.732 0 0 1-1.85.262H0V4.084h6.947zm-.146 6.405c.461.029.918-.109 1.286-.389.339-.323.515-.78.475-1.246a1.609 1.609 0 0 0-.158-.756 1.182 1.182 0 0 0-.421-.471 1.7 1.7 0 0 0-.6-.238 3.694 3.694 0 0 0-.71-.066H3.713v3.166H6.8zm.17 6.721c.262.005.524-.021.781-.078.241-.052.47-.151.67-.293.199-.143.36-.332.469-.553.124-.286.183-.596.171-.908.046-.602-.184-1.193-.626-1.604-.5-.347-1.103-.516-1.71-.479H3.715v3.916l3.256-.001zm9.665-9.282h6.214v1.512h-6.214V7.928zm5.726 5.354a2.674 2.674 0 0 0-.394-1.001 2.378 2.378 0 0 0-.787-.708 2.5 2.5 0 0 0-1.275-.275 2.689 2.689 0 0 0-1.343.293c-.331.187-.621.434-.852.731a2.39 2.39 0 0 0-.443.875c-.072.245-.114.498-.123.753h5.218v-.668z" />
        </svg>
      );
    case 'figma':
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path fill="#0ACF83" d="M8.148 24c2.476 0 4.49-2.014 4.49-4.49v-4.49H8.148a4.495 4.495 0 0 0-4.49 4.49C3.658 21.986 5.672 24 8.148 24z" />
          <path fill="#A259FF" d="M3.658 12c0-2.476 2.014-4.49 4.49-4.49h4.49v8.98h-4.49a4.495 4.495 0 0 1-4.49-4.49z" />
          <path fill="#F24E1E" d="M3.658 4.49C3.658 2.014 5.672 0 8.148 0h4.49v8.98h-4.49a4.495 4.495 0 0 1-4.49-4.49z" />
          <path fill="#FF7262" d="M12.638 0h4.49c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491h-4.49V0z" />
          <path fill="#1ABCFE" d="M21.618 12c0 2.476-2.014 4.49-4.49 4.49a4.495 4.495 0 0 1-4.49-4.49 4.495 4.495 0 0 1 4.49-4.49c2.476 0 4.49 2.014 4.49 4.49z" />
        </svg>
      );
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case 'pdf':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden>
          <path d="M14 3H7C5.9 3 5 3.9 5 5v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
          <path d="M14 3v5h5" />
          <text x="7.5" y="17.5" fontSize="5" fontWeight="700" fill="currentColor" stroke="none">PDF</text>
        </svg>
      );
    case 'image':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M3 17l5-5 4 4 3-3 6 6" />
        </svg>
      );
    case 'file':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden>
          <path d="M14 3H7C5.9 3 5 3.9 5 5v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case 'link':
    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 14c.5.67 1.5 1 2.5 1s2-.33 2.5-1l4-4c1.1-1.1 1.1-2.9 0-4s-2.9-1.1-4 0l-1 1" />
          <path d="M14 10c-.5-.67-1.5-1-2.5-1s-2 .33-2.5 1l-4 4c-1.1 1.1-1.1 2.9 0 4s2.9 1.1 4 0l1-1" />
        </svg>
      );
  }
}
