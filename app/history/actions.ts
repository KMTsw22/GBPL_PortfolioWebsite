'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function clean(value: FormDataEntryValue | null, max = 2000): string | null {
  const v = String(value ?? '').trim();
  if (!v) return null;
  return v.slice(0, max);
}

export async function createGalleryPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/history');

  const image_url = String(formData.get('image_url') ?? '').trim();
  if (!image_url) {
    return redirect('/history?error=' + encodeURIComponent('이미지를 먼저 업로드해주세요.'));
  }
  const caption = clean(formData.get('caption'));

  const { error } = await supabase.from('gallery_posts').insert({
    author_id: user.id,
    image_url,
    caption,
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

  const { error } = await supabase
    .from('gallery_posts')
    .update({ caption, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    return redirect('/history?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/history');
  redirect('/history');
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
    return redirect('/history?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/history');
  redirect('/history#post-' + post_id);
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
    return redirect('/history?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/history');
  redirect(post_id ? `/history#post-${post_id}` : '/history');
}
