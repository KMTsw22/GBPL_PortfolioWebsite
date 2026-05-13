'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function siteOrigin(h: Headers): string {
  // 1) 명시적 환경변수가 있으면 최우선 (배포 환경 강제 고정용)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  // 2) 요청 헤더의 origin — 사용자가 실제로 보고 있는 URL 과 일치 (가장 안전)
  const origin = h.get('origin');
  if (origin) return origin.replace(/\/$/, '');
  // 3) host + proto 조합
  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  if (host) return `${proto}://${host}`;
  // 4) VERCEL_URL — deployment-specific URL 이라 prod 도메인과 다를 수 있어 마지막 fallback
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function signInWithGoogle(formData: FormData) {
  const next = String(formData.get('next') ?? '/');
  const h = await headers();
  const origin = siteOrigin(h);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data?.url) {
    return redirect(`/login?error=${encodeURIComponent(error?.message ?? 'Google 로그인 시작 실패')}`);
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
