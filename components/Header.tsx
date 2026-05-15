import Image from 'next/image';
import Link from 'next/link';
import { signOut } from '@/app/login/actions';

export function Header({ name }: { name?: string | null }) {
  const isLoggedIn = !!name;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Image
            src="/gpbl-logo.png"
            alt="GPBL 5th"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg"
            priority
          />
          GPBL-5th
        </Link>
        <nav className="flex items-center gap-1 text-sm text-ink-soft">
          <Link href="/" className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-ink">
            Members
          </Link>
          <Link href="/history" className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-ink">
            History
          </Link>
          <Link href="/calendar" className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-ink">
            Calendar
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="rounded-md px-3 py-1.5 hover:bg-neutral-100 hover:text-ink">
                내 프로필
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="ml-2 rounded-md px-3 py-1.5 text-ink-muted hover:text-ink"
                >
                  {name} · 로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-md border border-line bg-white px-3 py-1.5 text-ink hover:bg-neutral-50"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
