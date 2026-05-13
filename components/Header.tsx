import Link from 'next/link';
import { signOut } from '@/app/login/actions';

export function Header({ name }: { name?: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-accent to-indigo-300" />
          Team Portfolio
        </Link>
        <nav className="flex items-center gap-1 text-sm text-ink-soft">
          <Link href="/" className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-ink">
            Members
          </Link>
          <Link href="/profile" className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-ink">
            내 프로필
          </Link>
          {name ? (
            <form action={signOut}>
              <button
                type="submit"
                className="ml-2 rounded-md px-3 py-1.5 text-ink-muted hover:text-ink"
              >
                {name} · 로그아웃
              </button>
            </form>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
