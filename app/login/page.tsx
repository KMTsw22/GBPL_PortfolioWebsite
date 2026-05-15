import Image from 'next/image';
import { signInWithGoogle } from './actions';

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/gpbl-logo.png"
            alt="GPBL 5th"
            width={56}
            height={56}
            className="mx-auto mb-4 h-14 w-14 rounded-2xl"
            priority
          />
          <h1 className="text-2xl font-semibold tracking-tight">GPBL-5th</h1>
          <p className="mt-1 text-sm text-ink-muted">
            등록된 Google 계정만 접근 가능
          </p>
        </div>

        <form
          action={signInWithGoogle}
          className="rounded-2xl border border-line bg-white p-6 shadow-card"
        >
          <input type="hidden" name="next" value={next ?? '/'} />

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50"
          >
            <GoogleIcon />
            Google 계정으로 로그인
          </button>

          {error ? (
            <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </form>

        <p className="mt-6 text-center text-xs text-ink-muted">
          접근 권한 받기: 관리자에게 본인 Google 이메일 알려주기
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
