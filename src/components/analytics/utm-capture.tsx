'use client';

import { useEffect } from 'react';
import { captureUtmAttributionFromLocation } from '@/lib/utm-attribution';

/** Persists first-touch UTMs and ad click IDs from the landing URL into the shared cookie. */
export function UtmCapture() {
  useEffect(() => {
    captureUtmAttributionFromLocation();
  }, []);

  return null;
}
