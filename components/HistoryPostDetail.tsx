'use client';

import { useEffect, useState } from 'react';
import { FileUploader } from './FileUploader';
import {
  updateGalleryPost,
  deleteGalleryPost,
  createGalleryComment,
  deleteGalleryComment,
} from '@/app/history/actions';
import { postImages, type GalleryPost } from '@/lib/types';

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

function formatEventDate(date: string) {
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export function HistoryPostDetail({ post, currentUserId }: Props) {
  const initialImages = postImages(post);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption ?? '');
  const [eventDate, setEventDate] = useState(post.event_date ?? '');
  const [images, setImages] = useState<string[]>(initialImages);
  const [commentBody, setCommentBody] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const isAuthor = currentUserId === post.author_id;
  const comments = post.comments ?? [];
  const currentImage = images[activeIdx] ?? images[0];

  // ESC 로 라이트박스 닫기
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  function removeImage(idx: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (activeIdx >= next.length) setActiveIdx(Math.max(0, next.length - 1));
      return next;
    });
  }

  function setCoverAt(idx: number) {
    setImages((prev) => {
      if (idx <= 0 || idx >= prev.length) return prev;
      const next = [...prev];
      const [picked] = next.splice(idx, 1);
      next.unshift(picked);
      setActiveIdx(0);
      return next;
    });
  }

  function cancelEdit() {
    setCaption(post.caption ?? '');
    setEventDate(post.event_date ?? '');
    setImages(initialImages);
    setEditing(false);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      {/* 메인 이미지 */}
      <div className="relative bg-neutral-50">
        {currentImage ? (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="block w-full cursor-zoom-in"
            aria-label="사진 크게 보기"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={post.caption ?? '사진'}
              className="mx-auto block max-h-[70vh] w-auto max-w-full object-contain"
            />
          </button>
        ) : null}

        {/* 슬라이드 indicator (2장 이상일 때만) */}
        {images.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-label={`${i + 1}번째 사진`}
                className={`h-1.5 rounded-full transition ${
                  i === activeIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* 썸네일 리스트 (2장 이상) */}
      {images.length > 1 ? (
        <div className="flex gap-1.5 overflow-x-auto border-t border-line bg-neutral-50 p-2">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${
                i === activeIdx ? 'border-accent' : 'border-transparent hover:border-line'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* 메타 + 액션 */}
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          {post.event_date ? (
            <h1 className="text-lg font-semibold tracking-tight">
              {formatEventDate(post.event_date)}
            </h1>
          ) : (
            <h1 className="text-lg font-semibold tracking-tight text-ink-muted">날짜 미지정</h1>
          )}
          <p className="mt-0.5 text-[12px] text-ink-muted">
            {timeAgo(post.created_at)} 업로드
            {images.length > 1 ? ` · 사진 ${images.length}장` : null}
          </p>
        </div>
        {isAuthor && !editing ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn px-3 py-1.5 text-xs"
            >
              편집
            </button>
            <form action={deleteGalleryPost}>
              <input type="hidden" name="id" value={post.id} />
              <button
                type="submit"
                onClick={(e) => { if (!confirm('이 게시물을 삭제할까요?')) e.preventDefault(); }}
                className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
              >
                삭제
              </button>
            </form>
          </div>
        ) : null}
      </header>

      {/* Caption / 편집 폼 */}
      <div className="px-5 py-4">
        {editing ? (
          <form action={updateGalleryPost} className="space-y-4">
            <input type="hidden" name="id" value={post.id} />
            <input type="hidden" name="image_urls" value={JSON.stringify(images)} />

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

            <div>
              <label className="label">사진 {images.length}장 · ⭐ 표시한 사진을 목록 대표로 노출하기</label>
              <div className="mb-2 grid grid-cols-4 gap-2">
                {images.map((url, i) => (
                  <div key={`${url}-${i}`} className={`group relative aspect-square overflow-hidden rounded-lg border-2 bg-neutral-50 ${i === 0 ? 'border-accent' : 'border-line'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    {i === 0 ? (
                      <span className="absolute left-1 top-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
                        ⭐ 대표
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCoverAt(i)}
                        className="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                      >
                        대표로
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                      aria-label="이 사진 제거"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {/* 새 사진 추가 */}
              <FileUploader
                bucket="gallery"
                userId={currentUserId ?? ''}
                accept="image/*"
                maxMB={300}
                onUploaded={(u) => setImages((prev) => [...prev, u.url])}
              />
            </div>

            <div>
              <label className="label">설명</label>
              <textarea
                name="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="input resize-none text-sm"
                maxLength={2000}
                placeholder="설명"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={cancelEdit} className="btn">취소</button>
              <button type="submit" className="btn-primary" disabled={images.length === 0}>
                저장
              </button>
            </div>
          </form>
        ) : post.caption ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-ink-soft">{post.caption}</p>
        ) : (
          <p className="text-sm italic text-ink-muted/70">(설명 없음)</p>
        )}
      </div>

      {/* 댓글 */}
      <div className="border-t border-line bg-neutral-50/50 px-5 py-4">
        <h2 className="label">댓글 {comments.length}개</h2>

        {comments.length > 0 ? (
          <ul className="mb-3 space-y-2">
            {comments.map((c) => {
              const canDelete = currentUserId === c.author_id;
              return (
                <li key={c.id} className="group flex items-start gap-2 text-sm">
                  <span className="shrink-0 font-medium text-ink">{c.author_name ?? c.author_email}</span>
                  <span className="min-w-0 flex-1 whitespace-pre-wrap text-ink-soft">{c.body}</span>
                  <span className="shrink-0 text-[11px] text-ink-muted">{timeAgo(c.created_at)}</span>
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
        ) : (
          <p className="mb-3 text-xs text-ink-muted">첫 댓글 달기</p>
        )}

        {currentUserId ? (
          <form action={createGalleryComment} className="flex items-center gap-2">
            <input type="hidden" name="post_id" value={post.id} />
            <input
              type="text"
              name="body"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="댓글 달기..."
              className="input flex-1 text-sm"
              maxLength={1000}
              required
            />
            <button type="submit" className="btn-primary">올리기</button>
          </form>
        ) : (
          <p className="text-xs text-ink-muted">로그인하고 댓글 달기</p>
        )}
      </div>

      {/* 라이트박스 */}
      {lightbox && currentImage ? (
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
            src={currentImage}
            alt={post.caption ?? '사진'}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-default rounded-lg"
          />
        </div>
      ) : null}
    </article>
  );
}
