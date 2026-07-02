'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { metaPageView } from '@/lib/meta-pixel';

export function MetaPixelPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    metaPageView();
  }, [pathname, searchParams]);

  return null;
}
