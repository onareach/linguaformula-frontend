'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomeNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const signInHref = `/sign-in?from=${encodeURIComponent(pathname || '/')}`;

  async function handleSignOut() {
    await logout();
    router.push(`${pathname || '/'}?signedOut=1`);
  }

  return (
    <>
      {user ? (
        <>
          <Link className="text-nav hover:text-nav-hover text-lg" href="/courses">
            courses
          </Link>
          <Link className="text-nav hover:text-nav-hover text-lg" href="/self-testing">
            self-testing
          </Link>
          <Link className="text-nav hover:text-nav-hover text-lg" href="/account">
            account
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-nav hover:text-nav-hover text-lg bg-transparent border-0 p-0 font-inherit cursor-pointer"
          >
            sign out
          </button>
        </>
      ) : (
        <Link className="text-nav hover:text-nav-hover text-lg" href={signInHref}>
          sign in
        </Link>
      )}
    </>
  );
}
