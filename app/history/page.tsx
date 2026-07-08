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

// event_date 가 있으면 그 날짜, 없으면 created_at 으로 정렬 키 산출
function sortKey(p: GalleryPost): string {
  return p.event_date ?? p.created_at;
}

export default async function HistoryPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 게시물 + 댓글 + 작성자 멤버 정보 병렬 fetch
  const [postsRes, commentsRes, membersRes] = await Promise.all([
    supabase.from('gallery_posts').select('*'),
    supabase.from('gallery_comments').select('*'),
    supabase.from('members').select('id, email, name, avatar_url'),
  ]);

  const rawPosts = (postsRes.data ?? []) as GalleryPost[];
  const rawComments = (commentsRes.data ?? []) as GalleryComment[];
  const members = (membersRes.data ?? []) as Pick<Member, 'id' | 'email' | 'name' | 'avatar_url'>[];
  const memberById = new Map(members.map((m) => [m.id, m]));

  // 댓글을 post_id 별로 묶기
  const commentsByPost = new Map<string, GalleryComment[]>();
  for (const c of rawComments) {
    if (!commentsByPost.has(c.post_id)) commentsByPost.set(c.post_id, []);
    commentsByPost.get(c.post_id)!.push(c);
  }

  // 작성자 정보 + 댓글 붙이고, event_date(없으면 created_at) 기준 최신순 정렬
  const posts: GalleryPost[] = rawPosts
    .map((p) => {
      const m = memberById.get(p.author_id);
      return {
        ...p,
        author_email: m?.email,
        author_name: m?.name ?? nameFromEmail(m?.email),
        author_avatar: m?.avatar_url ?? null,
        comments: commentsByPost.get(p.id) ?? [],
      };
    })
    .sort((a, b) => sortKey(b).localeCompare(sortKey(a)));

  return (
    <>
      <Header name={nameFromEmail(user?.email)} />

      <main className="container-page py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">History</h1>
            <p className="mt-1 text-sm text-ink-muted">
              사진으로 기록 남기기
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
            로그인하고 사진 올리기 · 댓글 달기
          </p>
        ) : null}

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-ink-muted">
            여기에 첫 사진 올리기
          </div>
        ) : (
          // 2열 그리드 — 고정 가로 비율 카드 (4:3) 로 일관된 모양
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {posts.map((p) => (
              <HistoryPostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
