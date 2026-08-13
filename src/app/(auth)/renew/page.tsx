import { RenewPageView } from '@/components/renew/renew-page-view';
import { normalizeLoginEmailParam } from '@/lib/login-url';
import { getRequestCountryIso } from '@/lib/request-country-code';
import { fetchCountries } from '@/utils/api';

type RenewPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function RenewPage({ searchParams }: RenewPageProps) {
  const params = await searchParams;
  const [countries, suggestedCountryIso] = await Promise.all([
    fetchCountries().catch(() => []),
    getRequestCountryIso(),
  ]);

  return (
    <RenewPageView
      countries={countries}
      suggestedCountryIso={suggestedCountryIso}
      initialEmail={normalizeLoginEmailParam(params.email) || undefined}
    />
  );
}
