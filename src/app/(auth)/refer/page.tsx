import { ReferPageView } from '@/components/refer/refer-page-view';
import { PortalShell } from '@/components/layout/portal/portal-shell';
import { hasProduct, PRODUCT_MEMBER_PORTAL } from '@/lib/access';
import { userNeedsPassword } from '@/lib/razorpay-checkout';
import { getRequestCountryIso } from '@/lib/request-country-code';
import { getMyAccess } from '@/utils/access-api';
import { fetchCountries, getLatestProfile, getMyEnrollments, ProfileFetchError } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export default async function ReferPage() {
  const [countries, suggestedCountryIso] = await Promise.all([
    fetchCountries().catch(() => []),
    getRequestCountryIso(),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      const access = await getMyAccess();
      if (hasProduct(access.products, PRODUCT_MEMBER_PORTAL)) {
        let profile = null;
        let profileError: string | null = null;
        let enrollments: Awaited<ReturnType<typeof getMyEnrollments>> = [];

        try {
          profile = await getLatestProfile();
        } catch (error) {
          if (error instanceof ProfileFetchError) {
            profileError = error.message;
          } else {
            profileError = 'Failed to load profile.';
          }
        }

        try {
          enrollments = await getMyEnrollments();
        } catch {
          enrollments = [];
        }

        const showPasswordBanner = userNeedsPassword(user);
        const referrerEmail = user.email?.trim() ?? '';
        const referrerFirstName = profile?.first_name?.trim() ?? '';
        const referrerLastName = profile?.last_name?.trim() ?? '';

        return (
          <PortalShell
            profile={profile}
            profileError={profileError}
            enrollments={enrollments}
            showPasswordBanner={showPasswordBanner}
          >
            <ReferPageView
              variant="portal"
              countries={countries}
              suggestedCountryIso={suggestedCountryIso}
              initialReferrerEmail={referrerEmail}
              initialReferrerFirstName={referrerFirstName}
              initialReferrerLastName={referrerLastName}
              wrapInAuthLayout={false}
            />
          </PortalShell>
        );
      }
    } catch {
      // Fall through to public layout for subscribe-only logged-in users.
    }

    const referrerEmail = user.email?.trim() ?? '';
    let referrerFirstName = '';
    let referrerLastName = '';
    try {
      const profile = await getLatestProfile();
      referrerFirstName = profile.first_name?.trim() ?? '';
      referrerLastName = profile.last_name?.trim() ?? '';
    } catch {
      // Profile may not exist yet on subscribe path; referrer name fields stay empty.
    }

    return (
      <ReferPageView
        variant="public"
        countries={countries}
        suggestedCountryIso={suggestedCountryIso}
        initialReferrerEmail={referrerEmail}
        initialReferrerFirstName={referrerFirstName}
        initialReferrerLastName={referrerLastName}
      />
    );
  }

  return <ReferPageView variant="public" countries={countries} suggestedCountryIso={suggestedCountryIso} />;
}
