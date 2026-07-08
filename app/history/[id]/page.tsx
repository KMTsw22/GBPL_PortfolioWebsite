import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { HistoryPostDetail } from '@/components/HistoryPostDetail';
import { nameFromEmail } from '@/lib/roster';
import type { GalleryPost, GalleryComment, Member } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function HistoryDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [postRes, commentsRes, membersRes] = await Promise.all([
    supabase.from('gallery_posts').select('*').eq('id', id).maybeSingle(),
    supabase.from('gallery_comments').select('*').eq('post_id', id).order('created_at', { ascending: true }),
    supabase.from('members').select('id, email, name, avatar_url'),
  ]);

  if (!postRes.data) return notFound();

  const rawPost = postRes.data as GalleryPost;
  const rawComments = (commentsRes.data ?? []) as GalleryComment[];
  const members = (membersRes.data ?? []) as Pick<Member, 'id' | 'email' | 'name' | 'avatar_url'>[];
  const memberById = new Map(members.map((m) => [m.id, m]));

  const comments: GalleryComment[] = rawComments.map((c) => {
    const m = memberById.get(c.author_id);
    return {
      ...c,
      author_email: m?.email,
      author_name: m?.name ?? nameFromEmail(m?.email),
    };
  });

  const post: GalleryPost = { ...rawPost, comments };

  return (
    <>
      <Header name={nameFromEmail(user?.email)} />

      <main className="container-page py-10">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/history"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            History
          </Link>

          {error ? (
            <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          <HistoryPostDetail post={post} currentUserId={user?.id ?? null} />
        </div>
      </main>
    </>
  );
}
