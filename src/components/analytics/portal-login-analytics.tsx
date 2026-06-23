'use client';

import { useEffect } from 'react';
import { trackPortalLogin } from '@/lib/gtag';
import { consumePortalLoginPending } from '@/lib/portal-login-pending';

export function PortalLoginAnalytics() {
  useEffect(() => {
    const method = consumePortalLoginPending();
    if (method) {
      trackPortalLogin(method);
    }
  }, []);

  return null;
}
