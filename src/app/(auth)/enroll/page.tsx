import { EnrollPageView } from '@/components/enroll/enroll-page-view';
import { getRequestCountryIso } from '@/lib/request-country-code';
import { fetchCountries } from '@/utils/api';

export default async function EnrollPage() {
  const [countries, suggestedCountryIso] = await Promise.all([
    fetchCountries().catch(() => []),
    getRequestCountryIso(),
  ]);

  return (
    <EnrollPageView
      product="trial_3m"
      welcomeProductParam="trial_3m"
      countries={countries}
      suggestedCountryIso={suggestedCountryIso}
    />
  );
}
