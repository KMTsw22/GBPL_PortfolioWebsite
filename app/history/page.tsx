import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { HistoryUploader } from '@/components/HistoryUploader';
import { HistoryPostCard } from '@/components/HistoryPostCard';
import { nameFromEmail } from '@/lib/roster';
import type { GalleryPost, GalleryComment, Member } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function HistoryPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 게시물 + 댓글 + 작성자 멤버 정보 가져오기 (병렬)
  const [postsRes, commentsRes, membersRes] = await Promise.all([
    supabase
      .from('gallery_posts')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('gallery_comments')
      .select('*')
      .order('created_at', { ascending: true }),
    supabase
      .from('members')
      .select('id, email, name, avatar_url'),
  ]);

  const rawPosts = (postsRes.data ?? []) as GalleryPost[];
  const rawComments = (commentsRes.data ?? []) as GalleryComment[];
  const members = (membersRes.data ?? []) as Pick<Member, 'id' | 'email' | 'name' | 'avatar_url'>[];

  const memberById = new Map(members.map((m) => [m.id, m]));

  // 댓글을 post_id 별로 묶기
  const commentsByPost = new Map<string, GalleryComment[]>();
  for (const c of rawComments) {
    const m = memberById.get(c.author_id);
    const enriched: GalleryComment = {
      ...c,
      author_email: m?.email,
      author_name: m?.name ?? nameFromEmail(m?.email),
    };
    if (!commentsByPost.has(c.post_id)) commentsByPost.set(c.post_id, []);
    commentsByPost.get(c.post_id)!.push(enriched);
  }

  // 게시물에 작성자 정보 + 댓글 붙이기
  const posts: GalleryPost[] = rawPosts.map((p) => {
    const m = memberById.get(p.author_id);
    return {
      ...p,
      author_email: m?.email,
      author_name: m?.name ?? nameFromEmail(m?.email),
      author_avatar: m?.avatar_url ?? null,
      comments: commentsByPost.get(p.id) ?? [],
    };
  });

  return (
    <>
      <Header name={nameFromEmail(user?.email)} />

      <main className="container-page py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">History</h1>
              <p className="mt-1 text-sm text-ink-muted">
                팀의 순간들 — 사진과 함께 남기고, 서로 댓글로 나눠요.
              </p>
            </div>
            {user ? (
              <div className="shrink-0">
                <HistoryUploader userId={user.id} />
              </div>
            ) : null}
          </div>

          {error ? (
            <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {!user ? (
            <p className="mb-6 rounded-xl border border-line bg-neutral-50 p-4 text-center text-xs text-ink-muted">
              로그인하면 사진을 올리고 댓글을 달 수 있어요.
            </p>
          ) : null}

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-ink-muted">
              아직 올라온 사진이 없어요.
              {user ? ' 위 "+ 사진 올리기" 로 첫 사진을 남겨보세요.' : ''}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((p) => (
                <HistoryPostCard key={p.id} post={p} currentUserId={user?.id ?? null} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
