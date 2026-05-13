'use client';

import { useRef, useState, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type Uploaded = { url: string; name: string; size: number; type: string };

type Props = {
  bucket: 'avatars' | 'resumes';
  userId: string;
  accept?: string;
  maxMB?: number;
  onUploaded: (u: Uploaded) => void;
  children?: ReactNode;
  className?: string;
};

function asciiSafe(name: string) {
  return name.replace(/[^\w.\-]/g, '_');
}

export function FileUploader({
  bucket,
  userId,
  accept,
  maxMB = 10,
  onUploaded,
  children,
  className = '',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > maxMB * 1024 * 1024) {
      setError(`파일이 너무 커요 (최대 ${maxMB}MB)`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const safe = asciiSafe(file.name);
      const path = `${userId}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploaded({ url: data.publicUrl, name: file.name, size: file.size, type: file.type });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '업로드 실패';
      setError(msg);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
      onDrop={(e) => { e.preventDefault(); setDrag(false); void handleFiles(e.dataTransfer.files); }}
      className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition ${
        drag ? 'border-accent bg-accent-soft' : 'border-line bg-neutral-50 hover:border-neutral-300 hover:bg-white'
      } ${className}`}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      {children ?? (
        <div className="flex flex-col items-center gap-1.5 text-sm text-ink-soft">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink-muted" fill="none" aria-hidden>
            <path d="M12 16V4M12 4L7 9M12 4L17 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 17V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>여기에 파일을 끌어다 놓거나 <span className="font-medium text-ink underline">클릭해서 선택</span></p>
          <p className="text-xs text-ink-muted">최대 {maxMB}MB</p>
        </div>
      )}
      {busy ? (
        <div className="absolute inset-0 grid place-items-center rounded-xl bg-white/80 text-sm text-ink-soft">
          업로드 중...
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
