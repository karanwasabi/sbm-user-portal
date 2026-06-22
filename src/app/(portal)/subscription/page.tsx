import { SubscriptionView } from '@/components/subscription/subscription-view';
import { getBillingProfile, getMySubscription, ProfileFetchError } from '@/utils/api';

export default async function SubscriptionPage() {
  let subscription: Awaited<ReturnType<typeof getMySubscription>> | null = null;
  let billingProfile: Awaited<ReturnType<typeof getBillingProfile>> = null;
  let error: string | null = null;

  try {
    subscription = await getMySubscription();
    try {
      billingProfile = await getBillingProfile();
    } catch {
      billingProfile = null;
    }
  } catch (err) {
    if (err instanceof ProfileFetchError && err.status === 404) {
      error = 'no_subscription';
    } else {
      error = err instanceof ProfileFetchError ? err.message : 'Failed to load subscription.';
    }
  }

  return <SubscriptionView subscription={subscription} billingProfile={billingProfile} error={error} />;
}
