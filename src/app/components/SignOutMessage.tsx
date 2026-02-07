'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export default function SignOutMessage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('signedOut') === '1') {
      setShow(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('signedOut');
      const newPath = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newPath, { scroll: false });
    }
  }, [pathname, searchParams, router]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded shadow-md bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600"
      role="status"
      aria-live="polite"
    >
      <p className="text-[#6b7c3d] font-medium text-center whitespace-nowrap">
        you have signed out successfully.
      </p>
    </div>
  );
}
