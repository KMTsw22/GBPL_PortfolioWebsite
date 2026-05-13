'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function changePassword(formData: FormData) {
  const next_pw = String(formData.get('next_pw') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (next_pw.length < 4) {
    return redirect(`/account?error=${encodeURIComponent('비밀번호는 4자 이상이어야 해요.')}`);
  }
  if (next_pw !== confirm) {
    return redirect(`/account?error=${encodeURIComponent('두 비밀번호가 일치하지 않아요.')}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { error } = await supabase.auth.updateUser({ password: next_pw });
  if (error) {
    return redirect(`/account?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/account?saved=1');
}
