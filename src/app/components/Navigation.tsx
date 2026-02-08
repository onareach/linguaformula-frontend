'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

function NavLinks({
  pathname,
  user,
  onSignOut,
  onLinkClick,
}: {
  pathname: string;
  user: unknown;
  onSignOut: () => void;
  onLinkClick?: () => void;
}) {
  return (
    <ul className="space-y-2 text-center md:space-y-2">
      <li className="p-0">
        <Link className="text-copy" href="/welcome" onClick={onLinkClick} suppressHydrationWarning>
          welcome
        </Link>
      </li>
      <li className="p-0">
        <Link className="text-nav hover:text-nav-hover" href="/formulas" onClick={onLinkClick}>
          formulas
        </Link>
      </li>
      <li className="p-0">
        <Link className="text-nav hover:text-nav-hover" href="/" onClick={onLinkClick}>
          home
        </Link>
      </li>
      <li className="p-0">
        {user ? (
          <Link className="text-nav hover:text-nav-hover" href="/account" onClick={onLinkClick}>
            account
          </Link>
        ) : (
          <Link className="text-nav hover:text-nav-hover" href={`/sign-in?from=${encodeURIComponent(pathname)}`} onClick={onLinkClick}>
            sign in
          </Link>
        )}
      </li>
      {user && (
        <li className="p-0">
          <button
            type="button"
            onClick={() => {
              onSignOut();
              onLinkClick?.();
            }}
            className="text-nav hover:text-nav-hover bg-transparent border-0 p-0 font-inherit cursor-pointer"
          >
            sign out
          </button>
        </li>
      )}
    </ul>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  if (pathname === '/') return null;

  async function handleSignOut() {
    await logout();
    router.push(`${pathname}?signedOut=1`);
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Desktop: sidebar (hidden on small screens) */}
      <nav
        className="order-2 mt-12 w-full hidden md:block md:mt-0 md:w-1/4"
        aria-label="Main navigation"
        suppressHydrationWarning
      >
        <div className="mb-4 text-center">
          <Image
            src="/logo.png"
            alt="Lingua Formula Logo"
            width={180}
            height={180}
            className="inline-block max-w-full h-auto"
            priority
          />
        </div>
        <NavLinks pathname={pathname} user={user} onSignOut={handleSignOut} />
      </nav>

      {/* Mobile: hamburger button (top-right, only on small screens) */}
      <div className="md:hidden fixed top-4 right-4 z-[60] order-2">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="p-2 rounded-md text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6b7c3d]"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile: overlay menu when open */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex justify-end"
          aria-modal
          role="dialog"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-black/30 dark:bg-black/50"
            onClick={closeMenu}
            aria-hidden
          />
          <div
            className="relative w-full max-w-[280px] bg-white dark:bg-zinc-900 shadow-xl flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
              <Image
                src="/logo.png"
                alt=""
                width={80}
                height={80}
                className="inline-block"
              />
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="p-2 rounded-md text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <NavLinks pathname={pathname} user={user} onSignOut={handleSignOut} onLinkClick={closeMenu} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
