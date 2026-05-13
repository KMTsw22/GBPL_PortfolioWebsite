import type { LinkItem } from '@/lib/types';

type Props = {
  items: LinkItem[];
  size?: 'sm' | 'md';
};

function fileNameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').pop() ?? '';
    const cleaned = decodeURIComponent(last).replace(/^\d+-/, '');
    return cleaned || 'download';
  } catch {
    return 'download';
  }
}

export function LinkButtons({ items, size = 'md' }: Props) {
  if (!items || items.length === 0) return null;

  const cls = size === 'sm'
    ? 'gap-1 px-2.5 py-1 text-xs'
    : 'gap-2 px-3.5 py-2 text-sm';

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it, i) => {
        const isFile = it.kind === 'file';
        const baseClass = `inline-flex items-center rounded-lg border border-line bg-white font-medium text-ink transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 ${cls}`;
        return isFile ? (
          <a
            key={`${it.url}-${i}`}
            href={it.url}
            download={fileNameFromUrl(it.url)}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClass}
            title="다운로드"
          >
            <FileIcon />
            {it.label}
          </a>
        ) : (
          <a
            key={`${it.url}-${i}`}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClass}
            title="새 탭에서 열기"
          >
            <LinkIcon />
            {it.label}
            <ExternalIcon />
          </a>
        );
      })}
    </div>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-ink-muted" fill="none" aria-hidden>
      <path d="M12 16V4M12 16L7 11M12 16L17 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 20H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-ink-muted" fill="none" aria-hidden>
      <path d="M10 14C10.5 14.6667 11.5 15 12.5 15C13.5 15 14.5 14.6667 15 14L19 10C20.1046 8.89543 20.1046 7.10457 19 6C17.8954 4.89543 16.1046 4.89543 15 6L14 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 10C13.5 9.33333 12.5 9 11.5 9C10.5 9 9.5 9.33333 9 10L5 14C3.89543 15.1046 3.89543 16.8954 5 18C6.10457 19.1046 7.89543 19.1046 9 18L10 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 text-ink-muted" fill="none" aria-hidden>
      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
