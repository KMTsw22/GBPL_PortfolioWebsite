import { signIn } from './actions';

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-indigo-300" />
          <h1 className="text-2xl font-semibold tracking-tight">Team Portfolio</h1>
          <p className="mt-1 text-sm text-ink-muted">
            12명의 멤버만 접근할 수 있어요.
          </p>
        </div>

        <form
          action={signIn}
          className="rounded-2xl border border-line bg-white p-6 shadow-card"
        >
          <input type="hidden" name="next" value={next ?? '/'} />

          <div className="mb-4">
            <label htmlFor="name" className="label">이름</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="username"
              required
              className="input"
              placeholder="예: 김민태"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="label">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn-primary w-full">
            로그인
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-muted">
          비밀번호를 까먹었으면 관리자에게 문의하세요.
        </p>
      </div>
    </main>
  );
}
