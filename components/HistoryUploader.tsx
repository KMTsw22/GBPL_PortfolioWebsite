'use client';

import { useState } from 'react';
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        + 사진 올리기
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">새 사진 올리기</h3>
        <button
          type="button"
          onClick={reset}
          className="rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-neutral-100 hover:text-ink"
        >
          닫기
        </button>
      </div>

      {imageUrl ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="업로드한 사진" className="h-auto w-full object-cover" />
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
          maxMB={20}
          onUploaded={(u) => setImageUrl(u.url)}
        />
      )}
    </div>
  );
}
