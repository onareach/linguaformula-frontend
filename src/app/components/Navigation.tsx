'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();
  
  // Hide navigation on the landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <nav className="mt-12 md:mt-0 w-full md:w-1/4">
      <div className="mb-8 text-center">
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
          <Link className="text-copy" href="/">
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
      </ul>
    </nav>
  );
}
