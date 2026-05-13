'use client';

import { useState } from 'react';
import { FileUploader } from './FileUploader';
import type { LinkItem } from '@/lib/types';

type Props = {
  items: LinkItem[];
  onChange: (items: LinkItem[]) => void;
  userId: string;
};

const PRESET_LABELS = ['LinkedIn', 'GitHub', 'Portfolio', 'Behance', 'Notion', 'Instagram', 'Website'];

export function LinksEditor({ items, onChange, userId }: Props) {
  const [draftLabel, setDraftLabel] = useState('');
  const [draftUrl, setDraftUrl] = useState('');

  function update(idx: number, patch: Partial<LinkItem>) {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  }
  function addLink() {
    const label = draftLabel.trim();
    const url = draftUrl.trim();
    if (!label || !url) return;
    onChange([...items, { label, url, kind: 'link', pinned: true }]);
    setDraftLabel('');
    setDraftUrl('');
  }
  function addFile(u: { url: string; name: string }) {
    onChange([...items, { label: u.name, url: u.url, kind: 'file', pinned: true }]);
  }

  return (
    <div className="space-y-5">
      {/* 등록된 항목들 */}
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((it, idx) => (
            <li
              key={idx}
              className="flex flex-col gap-2 rounded-xl border border-line bg-white p-3 sm:flex-row sm:items-center"
            >
              <div className="flex shrink-0 items-center gap-2 text-ink-muted">
                <KindIcon kind={it.kind} />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {it.kind === 'file' ? '파일' : '링크'}
                </span>
              </div>

              <input
                value={it.label}
                onChange={(e) => update(idx, { label: e.target.value })}
                placeholder="라벨 (예: LinkedIn, 이력서)"
                className="input flex-1 sm:max-w-[180px]"
              />

              <input
                value={it.url}
                onChange={(e) => update(idx, { url: e.target.value })}
                readOnly={it.kind === 'file'}
                placeholder="https://..."
                className={`input flex-1 ${it.kind === 'file' ? 'bg-neutral-50 text-ink-muted' : ''}`}
              />

              <div className="flex items-center gap-1">
                <IconBtn title="위로" onClick={() => move(idx, -1)}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none"><path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </IconBtn>
                <IconBtn title="아래로" onClick={() => move(idx, 1)}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </IconBtn>
                <PinToggle pinned={!!it.pinned} onToggle={() => update(idx, { pinned: !it.pinned })} />
                <IconBtn title="삭제" onClick={() => remove(idx)} danger>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none"><path d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19L19 7M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line bg-neutral-50 p-4 text-center text-xs text-ink-muted">
          아래에서 링크나 파일을 추가하세요. ⭐ 표시된 항목이 카드에 보여집니다.
        </p>
      )}

      {/* 링크 추가 */}
      <div className="rounded-xl border border-line bg-white p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted">+ 링크 추가</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="라벨 (예: LinkedIn)"
            list="preset-labels"
            className="input sm:max-w-[180px]"
          />
          <datalist id="preset-labels">
            {PRESET_LABELS.map((l) => <option key={l} value={l} />)}
          </datalist>
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://..."
            className="input flex-1"
          />
          <button type="button" onClick={addLink} className="btn">
            추가
          </button>
        </div>
      </div>

      {/* 파일 업로드 */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-muted">+ 파일 업로드 (PDF / DOC / 이미지)</p>
        <FileUploader
          bucket="resumes"
          userId={userId}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.hwp,.txt,application/pdf,image/*"
          maxMB={100}
          onUploaded={addFile}
        />
      </div>
    </div>
  );
}

function PinToggle({ pinned, onToggle }: { pinned: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={pinned ? '카드에서 숨기기' : '카드에 표시하기'}
      className={`grid h-8 w-8 place-items-center rounded-md transition ${
        pinned ? 'text-amber-500 hover:bg-amber-50' : 'text-ink-muted hover:bg-neutral-100'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={pinned ? 'currentColor' : 'none'}>
        <path d="M12 2L14.4721 7.05279L20 7.85738L16 11.7574L16.9443 17.2639L12 14.6738L7.05573 17.2639L8 11.7574L4 7.85738L9.52786 7.05279L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function IconBtn({
  children, onClick, title, danger,
}: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`grid h-8 w-8 place-items-center rounded-md text-ink-muted transition hover:bg-neutral-100 ${
        danger ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function KindIcon({ kind }: { kind: 'link' | 'file' }) {
  if (kind === 'file') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M14 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8L14 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M14 3V8H19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M10 14C10.5 14.6667 11.5 15 12.5 15C13.5 15 14.5 14.6667 15 14L19 10C20.1046 8.89543 20.1046 7.10457 19 6C17.8954 4.89543 16.1046 4.89543 15 6L14 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 10C13.5 9.33333 12.5 9 11.5 9C10.5 9 9.5 9.33333 9 10L5 14C3.89543 15.1046 3.89543 16.8954 5 18C6.10457 19.1046 7.89543 19.1046 9 18L10 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
