import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { nameFromEmail } from '@/lib/roster';
import { isCircleMember } from '@/lib/circle';
import { createPrivateNote, deletePrivateNote } from './actions';
import type { Member } from '@/lib/types';

export const dynamic = 'force-dynamic';

type PrivateNote = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function PrivatePage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인 안했으면 로그인으로 (미들웨어에서도 처리되지만 안전하게 한 번 더)
  if (!user) redirect('/login?next=/private');
  // 서클 4명(김민태·김찬중·배준원·박유나)이 아니면 홈으로
  if (!isCircleMember(user.email)) redirect('/');

  const [notesRes, membersRes] = await Promise.all([
    supabase.from('private_notes').select('*'),
    supabase.from('members').select('id, email, name'),
  ]);

  const rawNotes = (notesRes.data ?? []) as PrivateNote[];
  const members = (membersRes.data ?? []) as Pick<Member, 'id' | 'email' | 'name'>[];
  const memberById = new Map(members.map((m) => [m.id, m]));

  const notes = [...rawNotes].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <>
      <Header name={nameFromEmail(user.email)} isCircleMember />

      <main className="container-page py-12">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Private</h1>
            <span className="rounded-full border border-line bg-neutral-50 px-2 py-0.5 text-xs text-ink-muted">
              🔒 4인 전용
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            김민태 · 김찬중 · 배준원 · 박유나 만 볼 수 있는 공간
          </p>
        </div>

        {error ? (
          <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {/* 작성 폼 */}
        <form action={createPrivateNote} className="mb-8 rounded-2xl border border-line bg-white p-4">
          <textarea
            name="body"
            required
            maxLength={2000}
            rows={3}
            placeholder="여기에 우리끼리 남길 메모를 적어요…"
            className="w-full resize-y rounded-xl border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-ink-soft"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              올리기
            </button>
          </div>
        </form>

        {/* 목록 */}
        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-ink-muted">
            아직 아무 메모도 없어요. 첫 메모를 남겨보세요.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {notes.map((n) => {
              const m = memberById.get(n.author_id);
              const authorName = m?.name ?? nameFromEmail(m?.email);
              const mine = n.author_id === user.id;
              return (
                <li key={n.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">{authorName}</span>
                      <span className="text-xs text-ink-muted">{formatWhen(n.created_at)}</span>
                    </div>
                    {mine ? (
                      <form action={deletePrivateNote}>
                        <input type="hidden" name="id" value={n.id} />
                        <button
                          type="submit"
                          className="rounded-md px-2 py-1 text-xs text-ink-muted hover:text-rose-600"
                        >
                          삭제
                        </button>
                      </form>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm text-ink">{n.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
