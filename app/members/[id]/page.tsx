import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { Avatar } from '@/components/Avatar';
import { LinkButtons } from '@/components/LinkButtons';
import { nameFromEmail } from '@/lib/roster';
import type { Member } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function MemberPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!member) return notFound();
  const m = member as Member;

  return (
    <>
      <Header name={nameFromEmail(user?.email)} />

      <main className="container-page py-12">
        <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Members
        </Link>

        <div className="rounded-2xl border border-line bg-white p-8 shadow-card sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={m.name} src={m.avatar_url} size={88} />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{m.name}</h1>
              {m.role ? <p className="mt-1 text-sm text-ink-muted">{m.role}</p> : null}
            </div>
          </div>

          {m.bio ? (
            <section className="mt-8">
              <h2 className="label">About</h2>
              <p className="text-[15px] leading-7 text-ink-soft whitespace-pre-wrap">{m.bio}</p>
            </section>
          ) : null}

          {m.tags && m.tags.length > 0 ? (
            <section className="mt-8">
              <h2 className="label">Tags</h2>
              <div className="-mx-2 flex gap-1.5 overflow-x-auto px-2 pb-2">
                {m.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </section>
          ) : null}

          {m.links && m.links.length > 0 ? (
            <section className="mt-8">
              <h2 className="label">Links & Files</h2>
              <LinkButtons items={m.links} />
            </section>
          ) : null}

          {user?.id === m.id ? (
            <div className="mt-10 border-t border-line pt-6">
              <Link href="/profile" className="btn">
                내 프로필 편집하기
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
