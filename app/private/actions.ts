'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function clean(value: FormDataEntryValue | null, max = 2000): string | null {
  const v = String(value ?? '').trim();
  if (!v) return null;
  return v.slice(0, max);
}

export async function createPrivateNote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/private');

  const body = clean(formData.get('body'), 2000);
  if (!body) return redirect('/private');

  const { error } = await supabase.from('private_notes').insert({
    author_id: user.id,
    body,
  });
  if (error) {
    return redirect('/private?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/private');
  redirect('/private');
}

export async function deletePrivateNote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login?next=/private');

  const id = String(formData.get('id') ?? '').trim();
  if (!id) return redirect('/private');

  const { error } = await supabase
    .from('private_notes')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    return redirect('/private?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/private');
  redirect('/private');
}
