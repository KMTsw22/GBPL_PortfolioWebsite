'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { normalizeUrl, type LinkItem, type LinkKind, type CardTheme } from '@/lib/types';

function clean(value: FormDataEntryValue | null): string | null {
  const v = String(value ?? '').trim();
  return v.length === 0 ? null : v;
}

function parseLinks(raw: FormDataEntryValue | null): LinkItem[] {
  const s = String(raw ?? '');
  if (!s) return [];
  try {
    const parsed = JSON.parse(s) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((it): it is Record<string, unknown> => typeof it === 'object' && it !== null)
      .map((it) => {
        const label = String(it.label ?? '').trim();
        const kindRaw = String(it.kind ?? 'link').trim();
        const kind: LinkKind = kindRaw === 'file' ? 'file' : 'link';
        // 파일은 우리 storage 가 만든 절대 URL 이라 그대로, 일반 링크는 정규화
        const url = kind === 'file'
          ? String(it.url ?? '').trim()
          : normalizeUrl(String(it.url ?? ''));
        const pinned = it.pinned === true;
        return { label, url, kind, pinned };
      })
      .filter((it) => it.label && it.url);
  } catch {
    return [];
  }
}

function parseTheme(raw: FormDataEntryValue | null): CardTheme {
  const s = String(raw ?? '');
  if (!s) return {};
  try {
    const parsed = JSON.parse(s) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const t = parsed as Record<string, unknown>;
    const out: CardTheme = {};
    if (typeof t.bgColor === 'string' && t.bgColor.trim()) out.bgColor = t.bgColor.trim();
    if (typeof t.bgImage === 'string' && t.bgImage.trim()) out.bgImage = t.bgImage.trim();
    if (typeof t.accentColor === 'string' && t.accentColor.trim()) out.accentColor = t.accentColor.trim();
    return out;
  } catch {
    return {};
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const tagsRaw = String(formData.get('tags') ?? '');
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  const payload = {
    id: user.id,
    email: user.email!,
    name: String(formData.get('name') ?? '').trim() || (user.email ?? 'Member'),
    role: clean(formData.get('role')),
    bio: clean(formData.get('bio')),
    avatar_url: clean(formData.get('avatar_url')),
    links: parseLinks(formData.get('links')),
    theme: parseTheme(formData.get('theme')),
    tags: tags.length ? tags : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('members').upsert(payload);
  if (error) {
    return redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/');
  revalidatePath(`/members/${user.id}`);
  redirect('/profile?saved=1');
}
