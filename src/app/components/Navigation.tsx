'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  if (pathname === '/') return null;

  return (
    <nav className="order-2 mt-12 w-full md:w-1/4 md:order-2 md:mt-0" suppressHydrationWarning>
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
      <ul className="space-y-2 text-center">
        <li className="p-0">
          <Link className="text-copy" href="/welcome" suppressHydrationWarning>
            welcome
          </Link>
        </li>
        <li className="p-0">
          <Link className="text-nav hover:text-nav-hover" href="/formulas">
            formulas
          </Link>
        </li>
        <li className="p-0">
          <Link className="text-nav hover:text-nav-hover" href="/">
            home
          </Link>
        </li>
        <li className="p-0">
          {user ? (
            <Link className="text-nav hover:text-nav-hover" href="/account">
              account
            </Link>
          ) : (
            <Link className="text-nav hover:text-nav-hover" href="/sign-in">
              sign in
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
