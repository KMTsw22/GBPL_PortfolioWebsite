import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { Avatar } from '@/components/Avatar';
import { LinkButtons } from '@/components/LinkButtons';
import { nameFromEmail } from '@/lib/roster';
import { readableText, type Member } from '@/lib/types';

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

  const theme = m.theme ?? {};
  const bgColor = theme.bgColor || '#ffffff';
  const textColor = readableText(bgColor) || undefined;
  const isDarkBg = textColor === '#ffffff';
  const hasBanner = !!theme.bgImage;
  const accent = theme.accentColor;
  const dividerColor = isDarkBg ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)';
  const tagBg = isDarkBg ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.05)';
  const subtleText = isDarkBg ? 'rgba(255,255,255,0.72)' : undefined;

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

        <div
          className="overflow-hidden rounded-2xl border border-line shadow-card"
          style={{ background: bgColor, color: textColor }}
        >
          {hasBanner ? (
            <div
              className="relative h-40 w-full bg-cover bg-center sm:h-56"
              style={{ backgroundImage: `url(${theme.bgImage})` }}
            >
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          ) : accent ? (
            <div className="h-2 w-full" style={{ background: accent }} />
          ) : null}

          <div className="px-6 pb-10 sm:px-10">
            <div className="flex flex-col gap-5 pt-8 sm:flex-row sm:items-center">
              <div>
                <Avatar name={m.name} src={m.avatar_url} size={112} />
              </div>
              <div className="min-w-0 flex-1">
                {accent ? (
                  <div className="mb-2 h-1 w-10 rounded-full" style={{ background: accent }} />
                ) : null}
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{m.name}</h1>
                {m.role ? (
                  <p className="mt-1 text-sm" style={{ color: subtleText, opacity: subtleText ? 1 : 0.7 }}>
                    {m.role}
                  </p>
                ) : null}
              </div>
            </div>

            {m.bio ? (
              <section className="mt-8">
                <h2 className="label" style={subtleText ? { color: subtleText } : undefined}>About</h2>
                <p
                  className="text-[15px] leading-7 whitespace-pre-wrap"
                  style={subtleText ? { color: subtleText } : undefined}
                >
                  {m.bio}
                </p>
              </section>
            ) : null}

            {m.tags && m.tags.length > 0 ? (
              <section className="mt-8 border-t pt-6" style={{ borderColor: dividerColor }}>
                <h2 className="label" style={subtleText ? { color: subtleText } : undefined}>Tags</h2>
                <div className="-mx-2 flex flex-wrap gap-1.5 px-2 pb-2">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px]"
                      style={{ background: tagBg, color: textColor }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {m.links && m.links.length > 0 ? (
              <section className="mt-8 border-t pt-6" style={{ borderColor: dividerColor }}>
                <h2 className="label" style={subtleText ? { color: subtleText } : undefined}>Links & Files</h2>
                <LinkButtons items={m.links} />
              </section>
            ) : null}

            {user?.id === m.id ? (
              <div className="mt-10 border-t pt-6" style={{ borderColor: dividerColor }}>
                <Link href="/profile" className="btn">
                  내 프로필 편집하기
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
