'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { metaPageView } from '@/lib/meta-pixel';

export function MetaPixelPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    metaPageView();
  }, [pathname, searchParams]);

  return null;
}
