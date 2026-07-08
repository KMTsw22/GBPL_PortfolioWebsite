import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAllowed } from '@/lib/allowlist';

// 로그인이 필요한 경로 (수정/계정 관련). 그 외는 비로그인도 그냥 볼 수 있음.
const PROTECTED_PATHS = ['/profile', '/account'];

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  // 1) 미인증 + 보호 경로 → 로그인으로
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // 2) 로그인했는데 화이트리스트(DB)에 없는 계정 → 강제 로그아웃 + 로그인으로
  //    signOut 으로 만들어진 쿠키 삭제 지시를 redirect 응답에 보존해야 함 (안 그러면 무한 루프)
  //    /login, /auth 경로는 제외 (콜백 처리/안내용)
  if (user && path !== '/login' && !path.startsWith('/auth')) {
    const ok = await isAllowed(user.email);
    if (!ok) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = '';
      url.searchParams.set('error', '등록되지 않은 Google 계정입니다.');
      const denied = NextResponse.redirect(url);
      response.cookies.getAll().forEach((c) => {
        denied.cookies.set(c.name, c.value, c);
      });
      return denied;
    }
  }

  // 3) 이미 로그인했는데 /login 으로 가려는 경우 → 홈으로
  if (user && path === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
