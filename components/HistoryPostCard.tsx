'use client';

import { useEffect, useState } from 'react';
import { Avatar } from './Avatar';
import {
  updateGalleryPost,
  deleteGalleryPost,
  createGalleryComment,
  deleteGalleryComment,
} from '@/app/history/actions';
import type { GalleryPost } from '@/lib/types';

type Props = {
  post: GalleryPost;
  currentUserId: string | null;
};

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' });
}

// 'YYYY-MM-DD' → '2026년 5월 14일' 형식
function formatEventDate(date: string) {
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

const COMMENTS_PREVIEW = 2;

export function HistoryPostCard({ post, currentUserId }: Props) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption ?? '');
  const [eventDate, setEventDate] = useState(post.event_date ?? '');
  const [commentBody, setCommentBody] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const isAuthor = currentUserId === post.author_id;
  const comments = post.comments ?? [];
  const visibleComments = showAllComments ? comments : comments.slice(-COMMENTS_PREVIEW);
  const hiddenCount = comments.length - visibleComments.length;
  const captionLong = (post.caption ?? '').length > 90;

  // ESC 로 라이트박스 닫기
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <>
      <article
        id={`post-${post.id}`}
        className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:shadow-card"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-3.5 pt-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={post.author_name ?? '?'} src={post.author_avatar} size={32} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{post.author_name ?? post.author_email}</p>
              <p className="text-[11px] text-ink-muted">
                {post.event_date ? (
                  <>
                    <span>{formatEventDate(post.event_date)}</span>
                    <span className="ml-1 opacity-60">· {timeAgo(post.created_at)} 업로드</span>
                  </>
                ) : (
                  timeAgo(post.created_at)
                )}
              </p>
            </div>
          </div>
          {isAuthor ? (
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="rounded-md px-2 py-1 text-[11px] text-ink-muted hover:bg-neutral-100 hover:text-ink"
              >
                {editing ? '취소' : '편집'}
              </button>
              <form action={deleteGalleryPost}>
                <input type="hidden" name="id" value={post.id} />
                <button
                  type="submit"
                  onClick={(e) => { if (!confirm('이 사진을 삭제할까요?')) e.preventDefault(); }}
                  className="rounded-md px-2 py-1 text-[11px] text-ink-muted hover:bg-rose-50 hover:text-rose-600"
                >
                  삭제
                </button>
              </form>
            </div>
          ) : null}
        </header>

        {/* Image — 클릭하면 라이트박스 */}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="mt-3 block w-full cursor-zoom-in bg-neutral-50"
          aria-label="사진 크게 보기"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.caption ?? '사진'}
            className="h-auto w-full"
            loading="lazy"
          />
        </button>

        {/* Caption */}
        {editing ? (
          <form action={updateGalleryPost} className="space-y-2 px-3.5 py-3">
            <input type="hidden" name="id" value={post.id} />
            <div>
              <label className="label">언제 있었던 일?</label>
              <input
                type="date"
                name="event_date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input text-sm"
              />
            </div>
            <textarea
              name="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="input resize-none text-sm"
              maxLength={2000}
              placeholder="설명"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCaption(post.caption ?? '');
                  setEventDate(post.event_date ?? '');
                  setEditing(false);
                }}
                className="btn"
              >
                취소
              </button>
              <button type="submit" className="btn-primary">저장</button>
            </div>
          </form>
        ) : post.caption ? (
          <div className="px-3.5 pt-3">
            <p className={`whitespace-pre-wrap text-sm leading-6 text-ink-soft ${captionLong && !captionExpanded ? 'line-clamp-3' : ''}`}>
              {post.caption}
            </p>
            {captionLong ? (
              <button
                type="button"
                onClick={() => setCaptionExpanded((v) => !v)}
                className="mt-1 text-[11px] text-ink-muted hover:text-ink"
              >
                {captionExpanded ? '접기' : '더보기'}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Comments */}
        <div className="mt-3 border-t border-line bg-neutral-50/60 px-3.5 py-3">
          {comments.length > 0 ? (
            <>
              {hiddenCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowAllComments(true)}
                  className="mb-2 text-[11px] text-ink-muted hover:text-ink"
                >
                  댓글 {hiddenCount}개 더보기
                </button>
              ) : null}
              <ul className="mb-2 space-y-1.5">
                {visibleComments.map((c) => {
                  const canDelete = currentUserId === c.author_id;
                  return (
                    <li key={c.id} className="group flex items-start gap-1.5 text-[13px] leading-5">
                      <span className="shrink-0 font-medium text-ink">{c.author_name ?? c.author_email}</span>
                      <span className="min-w-0 flex-1 whitespace-pre-wrap text-ink-soft">{c.body}</span>
                      {canDelete ? (
                        <form action={deleteGalleryComment} className="shrink-0">
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="post_id" value={post.id} />
                          <button
                            type="submit"
                            className="rounded px-1 text-[11px] text-ink-muted opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                            title="댓글 삭제"
                          >
                            ×
                          </button>
                        </form>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}

          {currentUserId ? (
            <form action={createGalleryComment} className="flex items-center gap-1.5">
              <input type="hidden" name="post_id" value={post.id} />
              <input
                type="text"
                name="body"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="댓글 달기..."
                className="input flex-1 px-2.5 py-1.5 text-[13px]"
                maxLength={1000}
                required
              />
              <button type="submit" className="btn px-2.5 py-1.5 text-xs">
                올리기
              </button>
            </form>
          ) : (
            <p className="text-[11px] text-ink-muted">댓글은 로그인 후.</p>
          )}
        </div>
      </article>

      {/* Lightbox */}
      {lightbox ? (
        <div
          onClick={() => setLightbox(false)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.caption ?? '사진'}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-default rounded-lg"
          />
          {post.caption ? (
            <p
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-6 left-1/2 max-w-[640px] -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 text-center text-sm text-white"
            >
              {post.caption}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
