import { Suspense } from 'react';
import { EnrollPageView } from '@/components/enroll/enroll-page-view';
import { getRequestCountryIso } from '@/lib/request-country-code';
import { fetchCountries } from '@/utils/api';

export default async function LateNov16EnrollMonthlyPage() {
  const [countries, suggestedCountryIso] = await Promise.all([
    fetchCountries().catch(() => []),
    getRequestCountryIso(),
  ]);

  return (
    <Suspense fallback={null}>
      <EnrollPageView
        product="trial_1m"
        welcomeProductParam="trial_1m"
        countries={countries}
        suggestedCountryIso={suggestedCountryIso}
        lateNov16
      />
    </Suspense>
  );
}
