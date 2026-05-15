'use client';

import { useEffect, useState } from 'react';
import { FileUploader } from './FileUploader';
import { createGalleryPost } from '@/app/history/actions';

type Props = { userId: string };

export function HistoryUploader({ userId }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [open, setOpen] = useState(false);

  function reset() {
    setImages([]);
    setCaption('');
    setEventDate('');
    setOpen(false);
  }

  function removeAt(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function setCoverAt(idx: number) {
    setImages((prev) => {
      if (idx <= 0 || idx >= prev.length) return prev;
      const next = [...prev];
      const [picked] = next.splice(idx, 1);
      next.unshift(picked);
      return next;
    });
  }

  // ESC 로 닫기 + 모달 열린 동안 body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') reset();
    }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        + 사진 올리기
      </button>

      {open ? (
        <div
          onClick={reset}
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-pop"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
              <h3 className="text-sm font-semibold tracking-tight">새 사진 올리기</h3>
              <button
                type="button"
                onClick={reset}
                aria-label="닫기"
                className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-neutral-100 hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className="overflow-y-auto p-5">
              {/* 이미 올린 사진 썸네일 */}
              {images.length > 0 ? (
                <div className="mb-3">
                  <p className="label">첨부된 사진 ({images.length}장) — ⭐ 표시가 대표 사진</p>
                  <div className="grid grid-cols-3 gap-2">
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
                          onClick={() => removeAt(i)}
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                          aria-label="이 사진 제거"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* 새 사진 추가 (계속 추가 가능) */}
              <FileUploader
                bucket="gallery"
                userId={userId}
                accept="image/*"
                maxMB={300}
                onUploaded={(u) => setImages((prev) => [...prev, u.url])}
              />

              {images.length > 0 ? (
                <form action={createGalleryPost} className="mt-4 space-y-3">
                  <input type="hidden" name="image_urls" value={JSON.stringify(images)} />
                  <div>
                    <label className="label">언제 있었던 일?</label>
                    <input
                      type="date"
                      name="event_date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="input"
                    />
                    <p className="mt-1 text-[11px] text-ink-muted">
                      비워두면 업로드 시각으로 정렬돼요.
                    </p>
                  </div>
                  <textarea
                    name="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="설명 (선택)"
                    rows={3}
                    className="input resize-none"
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button type="submit" className="btn-primary">
                      올리기
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
