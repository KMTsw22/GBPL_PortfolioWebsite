import Link from 'next/link';
import { Avatar } from './Avatar';
import { LinkButtons } from './LinkButtons';
import type { Member } from '@/lib/types';

export function MemberCard({ member }: { member: Member }) {
  const pinned = (member.links ?? []).filter((l) => l.pinned);

  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-card">
      <Link href={`/members/${member.id}`} className="block">
        <Avatar name={member.name} src={member.avatar_url} size={64} className="mb-4" />
        <h3 className="text-base font-semibold tracking-tight">{member.name}</h3>
        {member.role ? (
          <p className="mt-0.5 text-xs text-ink-muted">{member.role}</p>
        ) : null}
        {member.bio ? (
          <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{member.bio}</p>
        ) : null}
      </Link>

      {member.tags && member.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {member.tags.slice(0, 4).map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      ) : null}

      {pinned.length > 0 ? (
        <div className="mt-4 border-t border-line pt-4">
          <LinkButtons items={pinned} size="sm" />
        </div>
      ) : null}
    </div>
  );
}
