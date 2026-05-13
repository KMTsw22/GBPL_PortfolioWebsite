'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { emailFromName } from '@/lib/roster';

export async function signIn(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/');

  if (!name || !password) {
    return redirect(`/login?error=${encodeURIComponent('이름과 비밀번호를 입력해주세요.')}`);
  }

  const email = emailFromName(name);
  if (!email) {
    return redirect(`/login?error=${encodeURIComponent('등록된 이름이 아니에요. 정확히 입력했는지 확인해주세요.')}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent('비밀번호가 맞지 않아요.')}`);
  }

  revalidatePath('/', 'layout');
  redirect(next.startsWith('/') ? next : '/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
