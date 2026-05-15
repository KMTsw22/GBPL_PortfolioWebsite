'use client';

import { useEffect, useState } from 'react';
import { FileUploader } from './FileUploader';
import { createGalleryPost } from '@/app/history/actions';

type Props = { userId: string };

export function HistoryUploader({ userId }: Props) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [open, setOpen] = useState(false);

  function reset() {
    setImageUrl('');
    setCaption('');
    setOpen(false);
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
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-pop"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
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

            <div className="p-5">
              {imageUrl ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-line bg-neutral-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="업로드한 사진"
                      className="mx-auto block h-auto w-auto max-h-[60vh] max-w-full"
                    />
                  </div>
                  <form action={createGalleryPost} className="space-y-3">
                    <input type="hidden" name="image_url" value={imageUrl} />
                    <textarea
                      name="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="설명 (선택 — 어디서, 누구와, 무엇을 했는지)"
                      rows={3}
                      className="input resize-none"
                      maxLength={2000}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="btn"
                      >
                        다른 사진
                      </button>
                      <button type="submit" className="btn-primary">
                        올리기
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <FileUploader
                  bucket="gallery"
                  userId={userId}
                  accept="image/*"
                  maxMB={300}
                  onUploaded={(u) => setImageUrl(u.url)}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
