import { EnrollPageView } from '@/components/enroll/enroll-page-view';
import { getRequestCountryIso } from '@/lib/request-country-code';
import { fetchCountries } from '@/utils/api';

export default async function EnrollTrialPage() {
  const [countries, suggestedCountryIso] = await Promise.all([
    fetchCountries().catch(() => []),
    getRequestCountryIso(),
  ]);

  return (
    <EnrollPageView
      product="trial_1m"
      welcomeProductParam="trial_1m"
      countries={countries}
      suggestedCountryIso={suggestedCountryIso}
    />
  );
}
