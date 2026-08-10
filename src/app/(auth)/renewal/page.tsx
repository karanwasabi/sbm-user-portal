import { Suspense } from 'react';
import { RenewalLandingView } from '@/components/renewal/renewal-landing-view';

export default function RenewalLandingPage() {
  return (
    <Suspense fallback={null}>
      <RenewalLandingView />
    </Suspense>
  );
}
