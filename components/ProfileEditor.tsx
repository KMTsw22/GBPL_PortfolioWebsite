'use client';

import { useState } from 'react';
import { AvatarUploader } from './AvatarUploader';
import { LinksEditor } from './LinksEditor';
import { ThemeEditor } from './ThemeEditor';
import { updateProfile } from '@/app/profile/actions';
import type { Member, LinkItem, CardTheme } from '@/lib/types';

type Props = {
  userId: string;
  initial: Partial<Member>;
};

export function ProfileEditor({ userId, initial }: Props) {
  const [name, setName] = useState(initial.name ?? '');
  const [role, setRole] = useState(initial.role ?? '');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [tags, setTags] = useState((initial.tags ?? []).join(', '));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url ?? null);
  const [links, setLinks] = useState<LinkItem[]>(initial.links ?? []);
  const [theme, setTheme] = useState<CardTheme>(initial.theme ?? {});

  return (
    <form action={updateProfile} className="space-y-7">
      {/* hidden bridges to server action */}
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ''} />
      <input type="hidden" name="links" value={JSON.stringify(links)} />
      <input type="hidden" name="theme" value={JSON.stringify(theme)} />

      <Section title="사진">
        <AvatarUploader
          value={avatarUrl}
          onChange={setAvatarUrl}
          userId={userId}
          name={name}
        />
      </Section>

      <Section title="기본 정보">
        <Field label="이름" name="name" value={name} onChange={setName} required />
        <Field label="역할 / 한 줄 소개" name="role" value={role} onChange={setRole} placeholder="예: Frontend Engineer" />
        <Field label="자기소개" name="bio" value={bio} onChange={setBio} textarea placeholder="간단한 소개를 적어주세요." />
        <Field label="태그 (쉼표로 구분)" name="tags" value={tags} onChange={setTags} placeholder="React, TypeScript, Design" />
      </Section>

      <Section
        title="카드 꾸미기"
        hint="색상과 상단 배너 이미지로 자기 카드를 꾸며보세요."
      >
        <ThemeEditor
          value={theme}
          onChange={setTheme}
          userId={userId}
          preview={{ name, role, avatarUrl }}
        />
      </Section>

      <Section
        title="링크 & 파일"
        hint="⭐ 표시한 항목이 멤버 카드에 노출됩니다. 링크는 클릭, 파일은 다운로드 됩니다."
      >
        <LinksEditor items={links} onChange={setLinks} userId={userId} />
      </Section>

      <div className="sticky bottom-0 -mx-6 border-t border-line bg-canvas/90 px-6 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-2">
        <button type="submit" className="btn-primary w-full sm:w-auto">저장하기</button>
      </div>
    </form>
  );
}

function Section({
  title, hint, children,
}: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label, name, value, onChange, placeholder, required, textarea,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
          className="input resize-y"
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="input"
        />
      )}
    </div>
  );
}
