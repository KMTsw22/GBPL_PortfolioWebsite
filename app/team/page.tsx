import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { MemberCard } from '@/components/MemberCard';
import { nameFromEmail } from '@/lib/roster';
import type { Member } from '@/lib/types';

export const dynamic = 'force-dynamic';

// 이 페이지에 보여줄 멤버 (Members 페이지와 같은 카드, 이 4명만)
//   김민태 · 김찬중 · 배준원 · 박유나
const TEAM_EMAILS = [
  'mintae3827@kookmin.ac.kr',
  'chanjoongx@gmail.com',
  'junwon020124@gmail.com',
  'botw461@gmail.com',
].map((e) => e.toLowerCase());

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawMembers } = await supabase
    .from('members')
    .select('*')
    .in('email', TEAM_EMAILS);

  // 위 TEAM_EMAILS 에 적은 순서대로 정렬
  const order = new Map(TEAM_EMAILS.map((e, i) => [e, i]));
  const members = (rawMembers ? [...rawMembers] : []).sort(
    (a, b) =>
      (order.get(String(a.email).toLowerCase()) ?? 99) -
      (order.get(String(b.email).toLowerCase()) ?? 99),
  );

  return (
    <>
      <Header name={nameFromEmail(user?.email)} />

      <main className="container-page pb-24 pt-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-ink-muted">
            김민태 · 김찬중 · 배준원 · 박유나
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
    </>
  );
}
