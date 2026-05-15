'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function clean(value: FormDataEntryValue | null, max = 2000): string | null {
  const v = String(value ?? '').trim();
  if (!v) return null;
  return v.slice(0, max);
}

// 'YYYY-MM-DD' 형식만 통과시킴 (HTML date input 의 표준 포맷)
function cleanDate(value: FormDataEntryValue | null): string | null {
  const v = String(value ?? '').trim();
  if (!v) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

// "image_urls" form 필드에서 JSON 배열을 파싱 (storage public URL 만 통과)
function parseImageUrls(value: FormDataEntryValue | null): string[] {
  const s = String(value ?? '').trim();
  if (!s) return [];
  try {
    const parsed = JSON.parse(s);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((u) => String(u ?? '').trim())
      .filter((u) => /^https?:\/\//i.test(u));
  } catch {
    return [];
  }
}

export async function createGalleryPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/history');

  const image_urls = parseImageUrls(formData.get('image_urls'));
  if (image_urls.length === 0) {
    return redirect('/history?error=' + encodeURIComponent('이미지를 1장 이상 업로드해주세요.'));
  }
  const caption = clean(formData.get('caption'));
  const event_date = cleanDate(formData.get('event_date'));

  const { error } = await supabase.from('gallery_posts').insert({
    author_id: user.id,
    image_url: image_urls[0],   // 호환 컬럼 — 첫 번째 사진
    image_urls,
    caption,
    event_date,
  });
  if (error) {
    return redirect('/history?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/history');
  redirect('/history');
}

export async function updateGalleryPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/history');

  const id = String(formData.get('id') ?? '').trim();
  if (!id) return redirect('/history');

  const caption = clean(formData.get('caption'));
  const event_date = cleanDate(formData.get('event_date'));
  const image_urls = parseImageUrls(formData.get('image_urls'));

  // image_urls 가 제출됐고 1장 이상이면 사진 목록도 갱신, 아니면 사진은 그대로 두고 caption/date 만 갱신
  type Patch = {
    caption: string | null;
    event_date: string | null;
    updated_at: string;
    image_url?: string;
    image_urls?: string[];
  };
  const patch: Patch = {
    caption,
    event_date,
    updated_at: new Date().toISOString(),
  };
  if (image_urls.length > 0) {
    patch.image_url = image_urls[0];
    patch.image_urls = image_urls;
  }

  const { error } = await supabase
    .from('gallery_posts')
    .update(patch)
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    return redirect('/history?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/history');
  revalidatePath(`/history/${id}`);
  redirect(`/history/${id}`);
}

export async function deleteGalleryPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/history');

  const id = String(formData.get('id') ?? '').trim();
  if (!id) return redirect('/history');

  const { error } = await supabase
    .from('gallery_posts')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    return redirect('/history?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/history');
  redirect('/history');
}

export async function createGalleryComment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/history');

  const post_id = String(formData.get('post_id') ?? '').trim();
  const body = clean(formData.get('body'), 1000);
  if (!post_id || !body) return redirect('/history');

  const { error } = await supabase.from('gallery_comments').insert({
    post_id,
    author_id: user.id,
    body,
  });
  if (error) {
    return redirect(`/history/${post_id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/history');
  revalidatePath(`/history/${post_id}`);
  redirect(`/history/${post_id}`);
}

export async function deleteGalleryComment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/history');

  const id = String(formData.get('id') ?? '').trim();
  const post_id = String(formData.get('post_id') ?? '').trim();
  if (!id) return redirect('/history');

  const { error } = await supabase
    .from('gallery_comments')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    return redirect(`/history/${post_id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/history');
  revalidatePath(`/history/${post_id}`);
  redirect(post_id ? `/history/${post_id}` : '/history');
}
