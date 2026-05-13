import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { isAllowed } from '@/lib/allowlist';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('인증 코드가 없습니다.')}`, url.origin),
    );
  }

  // 핵심: redirect 응답을 미리 만들어두고, supabase 가 이 응답 객체에 직접 쿠키를 심도록 위임
  let response = NextResponse.redirect(
    new URL(nextParam.startsWith('/') ? nextParam : '/', url.origin),
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  const email = data.user?.email ?? null;
  const ok = await isAllowed(email);
  if (!ok) {
    // 화이트리스트에 없으면 즉시 로그아웃 (이때 supabase 가 쿠키 삭제 명령을 response 에 심음)
    await supabase.auth.signOut();
    // 목적지를 /login 으로 바꾸되, 위에서 심어진 쿠키 삭제 지시는 보존
    const denied = NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('등록되지 않은 Google 계정입니다. 관리자에게 본인 Gmail 을 알려주세요.')}`,
        url.origin,
      ),
    );
    response.cookies.getAll().forEach((c) => {
      denied.cookies.set(c.name, c.value, c);
    });
    return denied;
  }

  return response;
}
