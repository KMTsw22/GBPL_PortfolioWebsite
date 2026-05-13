import Link from 'next/link';
import { Avatar } from './Avatar';
import { LinkButtons } from './LinkButtons';
import { readableText, type Member } from '@/lib/types';

export function MemberCard({ member }: { member: Member }) {
  const pinned = (member.links ?? []).filter((l) => l.pinned);
  const theme = member.theme ?? {};
  const textColor = readableText(theme.bgColor) || undefined;
  const hasBanner = !!theme.bgImage;

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border border-line shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
      style={{ background: theme.bgColor || '#ffffff', color: textColor }}
    >
      {hasBanner ? (
        <Link
          href={`/members/${member.id}`}
          className="block h-24 bg-cover bg-center"
          style={{ backgroundImage: `url(${theme.bgImage})` }}
          aria-label={member.name}
        />
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <Link href={`/members/${member.id}`} className="block">
          {theme.accentColor ? (
            <div
              className="mb-3 h-1 w-10 rounded-full"
              style={{ background: theme.accentColor }}
            />
          ) : null}
          <Avatar
            name={member.name}
            src={member.avatar_url}
            size={64}
            className={hasBanner ? '-mt-14 ring-4 ring-white' : 'mb-4'}
          />
          <h3 className={`${hasBanner ? 'mt-3' : ''} text-base font-semibold tracking-tight`}>
            {member.name}
          </h3>
          {member.role ? (
            <p className="mt-0.5 text-xs opacity-70">{member.role}</p>
          ) : null}
          {member.bio ? (
            <p className="mt-3 line-clamp-2 text-sm opacity-80">{member.bio}</p>
          ) : null}
        </Link>

        {member.tags && member.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {member.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-[11px]"
                style={textColor === '#ffffff' ? { background: 'rgba(255,255,255,0.15)' } : undefined}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {pinned.length > 0 ? (
          <div className="mt-4 border-t border-current/10 pt-4" style={{ borderColor: textColor === '#ffffff' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }}>
            <LinkButtons items={pinned} size="sm" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
