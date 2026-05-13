'use client';

import { FileUploader } from './FileUploader';
import { Avatar } from './Avatar';
import { readableText, type CardTheme } from '@/lib/types';

type Props = {
  value: CardTheme;
  onChange: (theme: CardTheme) => void;
  userId: string;
  // 미리보기에 쓸 현재 입력값
  preview: { name: string; role: string; avatarUrl: string | null };
};

const PRESET_BG = ['#ffffff', '#f5f5f4', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#1f2937', '#111827'];
const PRESET_ACCENT = ['#2f5fff', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#0ea5e9'];

export function ThemeEditor({ value, onChange, userId, preview }: Props) {
  const set = (patch: Partial<CardTheme>) => onChange({ ...value, ...patch });
  const textColor = readableText(value.bgColor) || undefined;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      {/* Controls */}
      <div className="space-y-5">
        {/* 배경색 */}
        <div>
          <label className="label">카드 배경색</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.bgColor ?? '#ffffff'}
              onChange={(e) => set({ bgColor: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded border border-line"
            />
            <input
              type="text"
              value={value.bgColor ?? ''}
              onChange={(e) => set({ bgColor: e.target.value })}
              placeholder="#ffffff"
              className="input flex-1"
            />
            {value.bgColor ? (
              <button type="button" onClick={() => set({ bgColor: undefined })} className="btn">초기화</button>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESET_BG.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set({ bgColor: c })}
                title={c}
                style={{ background: c }}
                className="h-7 w-7 rounded-md border border-line hover:scale-110 transition"
              />
            ))}
          </div>
        </div>

        {/* 강조색 */}
        <div>
          <label className="label">강조색 (이름 위 라인)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.accentColor ?? '#2f5fff'}
              onChange={(e) => set({ accentColor: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded border border-line"
            />
            <input
              type="text"
              value={value.accentColor ?? ''}
              onChange={(e) => set({ accentColor: e.target.value })}
              placeholder="#2f5fff"
              className="input flex-1"
            />
            {value.accentColor ? (
              <button type="button" onClick={() => set({ accentColor: undefined })} className="btn">초기화</button>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESET_ACCENT.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set({ accentColor: c })}
                title={c}
                style={{ background: c }}
                className="h-7 w-7 rounded-md border border-line hover:scale-110 transition"
              />
            ))}
          </div>
        </div>

        {/* 배너 이미지 */}
        <div>
          <label className="label">상단 배너 이미지 (선택)</label>
          {value.bgImage ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value.bgImage} alt="banner" className="h-24 w-full rounded-lg border border-line object-cover" />
              <button type="button" onClick={() => set({ bgImage: undefined })} className="text-xs text-ink-muted underline hover:text-rose-600">
                배너 제거
              </button>
            </div>
          ) : (
            <FileUploader
              bucket="avatars"
              userId={userId}
              accept="image/png,image/jpeg,image/webp,image/gif"
              maxMB={100}
              onUploaded={(u) => set({ bgImage: u.url })}
            >
              <div className="flex flex-col items-center gap-1 text-sm text-ink-soft">
                <p>배너 이미지를 끌어다 놓거나 <span className="font-medium text-ink underline">클릭해서 선택</span></p>
                <p className="text-xs text-ink-muted">가로로 긴 이미지 추천 · 최대 100MB</p>
              </div>
            </FileUploader>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="md:sticky md:top-20 md:self-start">
        <p className="label mb-2">미리보기</p>
        <div
          className="overflow-hidden rounded-2xl border border-line shadow-sm"
          style={{ background: value.bgColor || '#ffffff', color: textColor }}
        >
          {value.bgImage ? (
            <div
              className="h-20 bg-cover bg-center"
              style={{ backgroundImage: `url(${value.bgImage})` }}
            />
          ) : null}
          <div className="p-5">
            {value.accentColor ? (
              <div className="mb-3 h-1 w-10 rounded-full" style={{ background: value.accentColor }} />
            ) : null}
            <Avatar
              name={preview.name || '?'}
              src={preview.avatarUrl}
              size={56}
              className={value.bgImage ? '-mt-12 ring-4 ring-white' : 'mb-2'}
            />
            <p className="mt-2 text-base font-semibold tracking-tight">
              {preview.name || '이름'}
            </p>
            {preview.role ? (
              <p className="mt-0.5 text-xs opacity-70">{preview.role}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
