import { RenewPageView } from '@/components/renew/renew-page-view';
import { getRequestCountryIso } from '@/lib/request-country-code';
import { fetchCountries } from '@/utils/api';

export default async function RenewPage() {
  const [countries, suggestedCountryIso] = await Promise.all([
    fetchCountries().catch(() => []),
    getRequestCountryIso(),
  ]);

  return <RenewPageView countries={countries} suggestedCountryIso={suggestedCountryIso} />;
}
