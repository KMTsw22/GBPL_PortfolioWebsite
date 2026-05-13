import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAllowed } from '@/lib/allowlist';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('인증 코드가 없습니다.')}`, url.origin),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  const email = data.user?.email ?? null;
  const ok = await isAllowed(email);
  if (!ok) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('등록되지 않은 Google 계정입니다. 관리자에게 본인 Gmail 을 알려주세요.')}`,
        url.origin,
      ),
    );
  }

  return NextResponse.redirect(new URL(nextParam.startsWith('/') ? nextParam : '/', url.origin));
}
