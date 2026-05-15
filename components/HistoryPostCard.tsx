import Link from 'next/link';
import { postImages, type GalleryPost } from '@/lib/types';

type Props = { post: GalleryPost };

function formatEventDate(date: string) {
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

function shortUploadAgo(iso: string) {
  const t = new Date(iso).getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' });
}

export function HistoryPostCard({ post }: Props) {
  const images = postImages(post);
  const cover = images[0];
  const more = images.length - 1;
  const commentCount = post.comments?.length ?? 0;

  return (
    <Link
      href={`/history/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
    >
      {/* 이미지 — 고정 비율 (4:3), 잘라서 채움 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={post.caption ?? '사진'}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : null}
        {more > 0 ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="14" height="14" rx="2" />
              <path d="M7 7v10a2 2 0 002 2h10" />
            </svg>
            +{more}
          </span>
        ) : null}
      </div>

      {/* 본문 — 고정 영역 (h-auto 지만 line-clamp 으로 일관성) */}
      <div className="flex flex-1 flex-col gap-1.5 px-4 py-3.5">
        <p className="text-[11px] text-ink-muted">
          {post.event_date ? formatEventDate(post.event_date) : `${shortUploadAgo(post.created_at)} 업로드`}
        </p>
        {post.caption ? (
          <p className="line-clamp-2 text-sm leading-6 text-ink-soft">
            {post.caption}
          </p>
        ) : (
          <p className="text-sm italic text-ink-muted/70">(설명 없음)</p>
        )}
        <div className="mt-auto pt-1 text-[11px] text-ink-muted">
          💬 댓글 {commentCount}개
        </div>
      </div>
    </Link>
  );
}
