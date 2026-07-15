import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { MemberCard } from '@/components/MemberCard';
import { nameFromEmail } from '@/lib/roster';
import type { Member } from '@/lib/types';

export const dynamic = 'force-dynamic';

const TEAM_EMAILS = [
  'mintae3827@kookmin.ac.kr',
  'chanjoongx@gmail.com',
  'iamlyg9667@gmail.com',
  'botw461@gmail.com',
].map((e) => e.toLowerCase());

const TEAM_NAMES = ['김민태', '박유나', '이영욱', '김찬중'];

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rawMembers } = await supabase
    .from('members')
    .select('*')
    .in('email', TEAM_EMAILS);

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
            Kookmin University PBL Program overview for our four-member team.
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Program Overview
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Kookmin University PBL in Irvine
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-muted">
            Kookmin University PBL is a J-1 visa program in Irvine where
            students learn through program-based classes, spend 6 months on a
            project-based curriculum, and then continue with 6 more months
            through an internship or an entry-level job. After that, they can
            extend the J-1 visa for another 6 months.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {TEAM_NAMES.map((name) => (
              <span
                key={name}
                className="rounded-full border border-line bg-secondary px-3 py-1 text-sm text-ink"
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        {members.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-ink-muted">
            No team members have been registered yet.
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
