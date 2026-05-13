import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { nameFromEmail } from '@/lib/roster';
import { changePassword } from './actions';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function AccountPage({ searchParams }: Props) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const displayName = nameFromEmail(user.email);

  return (
    <>
      <Header name={displayName} />

      <main className="container-page py-12">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight">계정 설정</h1>
          <p className="mt-1 text-sm text-ink-muted">
            로그인 이름: <span className="text-ink">{displayName}</span>
          </p>

          {saved ? (
            <p className="mt-6 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              비밀번호가 변경되었어요.
            </p>
          ) : null}
          {error ? (
            <p className="mt-6 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <form action={changePassword} className="mt-8 space-y-5 rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="text-base font-semibold">비밀번호 변경</h2>

            <div>
              <label htmlFor="next_pw" className="label">새 비밀번호</label>
              <input
                id="next_pw"
                name="next_pw"
                type="password"
                autoComplete="new-password"
                required
                minLength={4}
                className="input"
                placeholder="4자 이상"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="label">새 비밀번호 확인</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={4}
                className="input"
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary">변경하기</button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
