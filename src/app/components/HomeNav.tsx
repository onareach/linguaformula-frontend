'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomeNav() {
  const { user } = useAuth();
  return (
    <>
      {user ? (
        <Link className="text-nav hover:text-nav-hover text-lg" href="/account">
          account
        </Link>
      ) : (
        <Link className="text-nav hover:text-nav-hover text-lg" href="/sign-in">
          sign in
        </Link>
      )}
    </>
  );
}
