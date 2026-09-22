'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function AppMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Full-bleed standalone pages without container constraints or padding
  const isFullBleed =
    pathname === '/' ||
    pathname === '/login' ||
    pathname?.startsWith('/meeting');

  if (isFullBleed) {
    return <main className="flex-1 w-full flex flex-col">{children}</main>;
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      {children}
    </main>
  );
}
