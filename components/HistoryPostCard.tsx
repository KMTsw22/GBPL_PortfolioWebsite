'use client';

import { useState } from 'react';
import { Avatar } from './Avatar';
import {
  updateGalleryPost,
  deleteGalleryPost,
  createGalleryComment,
  deleteGalleryComment,
} from '@/app/history/actions';
import type { GalleryPost } from '@/lib/types';

type Props = {
  post: GalleryPost;
  currentUserId: string | null;
};

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' });
}

export function HistoryPostCard({ post, currentUserId }: Props) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption ?? '');
  const [commentBody, setCommentBody] = useState('');
  const isAuthor = currentUserId === post.author_id;
  const comments = post.comments ?? [];

  return (
    <article
      id={`post-${post.id}`}
      className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-3">
          <Avatar name={post.author_name ?? '?'} src={post.author_avatar} size={36} />
          <div>
            <p className="text-sm font-medium">{post.author_name ?? post.author_email}</p>
            <p className="text-[11px] text-ink-muted">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        {isAuthor ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-neutral-100 hover:text-ink"
            >
              {editing ? '취소' : '편집'}
            </button>
            <form action={deleteGalleryPost}>
              <input type="hidden" name="id" value={post.id} />
              <button
                type="submit"
                onClick={(e) => {
                  if (!confirm('이 사진을 삭제할까요?')) e.preventDefault();
                }}
                className="rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-rose-50 hover:text-rose-600"
              >
                삭제
              </button>
            </form>
          </div>
        ) : null}
      </header>

      {/* Image */}
      <div className="mt-3 bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image_url}
          alt={post.caption ?? '사진'}
          className="h-auto w-full"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <div className="px-4 py-3">
        {editing ? (
          <form action={updateGalleryPost} className="space-y-2">
            <input type="hidden" name="id" value={post.id} />
            <textarea
              name="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="input resize-none"
              maxLength={2000}
              placeholder="설명"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setCaption(post.caption ?? ''); setEditing(false); }}
                className="btn"
              >
                취소
              </button>
              <button type="submit" className="btn-primary">
                저장
              </button>
            </div>
          </form>
        ) : (
          post.caption ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-ink-soft">{post.caption}</p>
          ) : null
        )}
      </div>

      {/* Comments */}
      <div className="border-t border-line bg-neutral-50/50 px-4 py-3">
        {comments.length > 0 ? (
          <ul className="mb-3 space-y-2">
            {comments.map((c) => {
              const canDelete = currentUserId === c.author_id;
              return (
                <li key={c.id} className="group flex items-start gap-2 text-sm">
                  <span className="font-medium text-ink">{c.author_name ?? c.author_email}</span>
                  <span className="flex-1 whitespace-pre-wrap text-ink-soft">{c.body}</span>
                  <span className="shrink-0 text-[11px] text-ink-muted">{timeAgo(c.created_at)}</span>
                  {canDelete ? (
                    <form action={deleteGalleryComment} className="shrink-0">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="post_id" value={post.id} />
                      <button
                        type="submit"
                        className="rounded px-1 text-[11px] text-ink-muted opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                        title="댓글 삭제"
                      >
                        ×
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {currentUserId ? (
          <form action={createGalleryComment} className="flex items-center gap-2">
            <input type="hidden" name="post_id" value={post.id} />
            <input
              type="text"
              name="body"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="댓글 달기..."
              className="input flex-1 text-sm"
              maxLength={1000}
              required
            />
            <button type="submit" className="btn">
              올리기
            </button>
          </form>
        ) : (
          <p className="text-xs text-ink-muted">
            댓글을 달려면 로그인 필요.
          </p>
        )}
      </div>
    </article>
  );
}
