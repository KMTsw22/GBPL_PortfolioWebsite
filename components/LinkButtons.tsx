import { normalizeUrl, type LinkItem } from '@/lib/types';
import { LinkIcon } from '@/lib/linkIcons';

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
        const href = normalizeUrl(it.url);
        if (!href) return null;
        const baseClass = `inline-flex items-center rounded-lg border border-line bg-white font-medium text-ink transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 ${cls}`;
        return isFile ? (
          <a
            key={`${href}-${i}`}
            href={href}
            download={fileNameFromUrl(href)}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClass}
            title="다운로드"
          >
            <LinkIcon item={it} className="h-3.5 w-3.5 text-ink-muted" />
            {it.label}
          </a>
        ) : (
          <a
            key={`${href}-${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClass}
            title="새 탭에서 열기"
          >
            <LinkIcon item={it} className="h-3.5 w-3.5 text-ink-muted" />
            {it.label}
            <ExternalIcon />
          </a>
        );
      })}
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 text-ink-muted" fill="none" aria-hidden>
      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
