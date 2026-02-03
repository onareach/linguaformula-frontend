'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  return (
    <div className={`flex flex-col ${isLandingPage ? 'md:flex-row md:justify-center' : 'md:flex-row md:justify-between'} relative max-w-6xl mx-auto w-full`}>
      <main className={`${isLandingPage ? 'w-full' : 'w-full md:w-3/4 pr-0 md:pr-12'} space-y-6`}>
        {children}
      </main>
      <Navigation />
    </div>
  );
}
