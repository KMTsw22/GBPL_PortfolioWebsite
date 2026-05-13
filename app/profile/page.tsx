import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { ProfileEditor } from '@/components/ProfileEditor';
import { nameFromEmail } from '@/lib/roster';
import type { Member } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function ProfilePage({ searchParams }: Props) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('members')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const m = (data ?? {}) as Partial<Member>;

  return (
    <>
      <Header name={nameFromEmail(user.email)} />

      <main className="container-page py-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">내 프로필</h1>
              <p className="mt-1 text-sm text-ink-muted">
                여기서 입력한 내용이 멤버 카드와 상세 페이지에 보여져요.
              </p>
            </div>
            <Link href={`/members/${user.id}`} className="btn">미리보기</Link>
          </div>

          {saved ? (
            <p className="mt-6 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              저장되었어요.
            </p>
          ) : null}
          {error ? (
            <p className="mt-6 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="mt-8">
            <ProfileEditor userId={user.id} initial={m} />
          </div>
        </div>
      </main>
    </>
  );
}
