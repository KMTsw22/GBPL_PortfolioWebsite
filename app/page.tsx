import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { MemberCard } from '@/components/MemberCard';
import { ADMIN_EMAIL, nameFromEmail } from '@/lib/roster';
import { getAllowedEmails } from '@/lib/allowlist';
import type { Member } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const allowed = await getAllowedEmails();
  const { data: rawMembers } = await supabase
    .from('members')
    .select('*')
    .in('email', allowed.length > 0 ? allowed : [''])  // 빈 배열이면 PostgREST 가 에러
    .neq('email', ADMIN_EMAIL);

  // 매 요청마다 순서를 섞어서 노출 (Fisher-Yates)
  const members = rawMembers ? [...rawMembers] : [];
  for (let i = members.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [members[i], members[j]] = [members[j], members[i]];
  }

  return (
    <>
      <Header name={nameFromEmail(user?.email)} />

      <section className="container-page pb-10 pt-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          GPBL 5기
        </h1>
      </section>

      <main className="container-page pb-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Members</h2>
          <p className="text-sm text-ink-muted">
            카드를 클릭하여 자세히 보기
          </p>
        </div>

        {members.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-ink-muted">
            아직 등록된 멤버가 없어요.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(members as Member[]).map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-line py-7">
        <div className="container-page flex items-center justify-between text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} GPBL-5th</span>
          <span>Made with care.</span>
        </div>
      </footer>
    </>
  );
}
