import Image from 'next/image';
import Link from 'next/link';
import { signOut } from '@/app/login/actions';

export function Header({ name }: { name?: string | null }) {
  const isLoggedIn = !!name;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-2">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap font-semibold tracking-tight"
        >
          <Image
            src="/gpbl-logo.png"
            alt="GPBL 5th"
            width={40}
            height={40}
            className="h-8 w-8 rounded-lg sm:h-10 sm:w-10"
            priority
          />
          <span className="hidden sm:inline">GPBL-5th</span>
        </Link>
        <nav className="flex min-w-0 items-center gap-0.5 text-sm text-ink-soft sm:gap-1">
          <Link
            href="/"
            className="whitespace-nowrap rounded-md px-2 py-1.5 hover:bg-neutral-100 hover:text-ink sm:px-3"
          >
            Members
          </Link>
          <Link
            href="/history"
            className="whitespace-nowrap rounded-md px-2 py-1.5 hover:bg-neutral-100 hover:text-ink sm:px-3"
          >
            History
          </Link>
          <Link
            href="/calendar"
            className="whitespace-nowrap rounded-md px-2 py-1.5 hover:bg-neutral-100 hover:text-ink sm:px-3"
          >
            Calendar
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="hidden whitespace-nowrap rounded-md px-2 py-1.5 hover:bg-neutral-100 hover:text-ink sm:inline sm:px-3"
              >
                내 프로필
              </Link>
              <form action={signOut} className="shrink-0">
                <button
                  type="submit"
                  className="ml-1 whitespace-nowrap rounded-md px-2 py-1.5 text-ink-muted hover:text-ink sm:ml-2 sm:px-3"
                >
                  <span className="hidden sm:inline">{name} · </span>로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-1 shrink-0 whitespace-nowrap rounded-md border border-line bg-white px-2.5 py-1.5 text-ink hover:bg-neutral-50 sm:ml-2 sm:px-3"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
