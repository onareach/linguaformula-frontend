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
    <p className="text-[#6b7c3d] font-medium text-center mb-4">
      you have signed out successfully.
    </p>
  );
}
