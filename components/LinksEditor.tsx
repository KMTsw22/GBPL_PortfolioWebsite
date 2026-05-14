'use client';

import { useEffect, useRef, useState } from 'react';
import { FileUploader } from './FileUploader';
import type { LinkItem } from '@/lib/types';
import { ICON_OPTIONS, LinkIcon, type IconId } from '@/lib/linkIcons';

type Props = {
  items: LinkItem[];
  onChange: (items: LinkItem[]) => void;
  userId: string;
};

const PRESET_LABELS = ['LinkedIn', 'GitHub', 'Portfolio', 'Behance', 'Notion', 'Instagram', 'Website'];

export function LinksEditor({ items, onChange, userId }: Props) {
  const [draftLabel, setDraftLabel] = useState('');
  const [draftUrl, setDraftUrl] = useState('');
  const [draftIcon, setDraftIcon] = useState<IconId>('auto');

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
    onChange([...items, { label, url, kind: 'link', pinned: true, icon: draftIcon }]);
    setDraftLabel('');
    setDraftUrl('');
    setDraftIcon('auto');
  }
  function addFile(u: { url: string; name: string }) {
    onChange([...items, { label: u.name, url: u.url, kind: 'file', pinned: true, icon: 'auto' }]);
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
              <IconPicker
                item={it}
                value={(it.icon as IconId) ?? 'auto'}
                onSelect={(id) => update(idx, { icon: id })}
              />

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <IconPicker
            item={{ label: '', url: draftUrl, kind: 'link', icon: draftIcon }}
            value={draftIcon}
            onSelect={setDraftIcon}
          />
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
        <p className="mt-2 text-[11px] text-ink-muted">
          아이콘은 "자동"이 기본 — URL 도메인을 보고 알아서 골라줘요. 원하면 직접 선택.
        </p>
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

function IconPicker({
  item,
  value,
  onSelect,
}: {
  item: LinkItem;
  value: IconId;
  onSelect: (id: IconId) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="아이콘 선택"
        aria-label="아이콘 선택"
        className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-ink hover:bg-neutral-50"
      >
        <LinkIcon item={item} className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-[260px] rounded-lg border border-line bg-white p-2 shadow-card">
          <p className="px-1 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">아이콘</p>
          <div className="grid grid-cols-6 gap-1">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { onSelect(opt.id); setOpen(false); }}
                title={opt.label}
                aria-label={opt.label}
                className={`group grid h-9 w-9 place-items-center rounded-md transition hover:bg-neutral-100 ${
                  value === opt.id ? 'bg-neutral-100 ring-1 ring-ink' : ''
                }`}
              >
                <LinkIcon iconId={opt.id} className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
