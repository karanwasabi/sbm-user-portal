import { SubscriptionView } from '@/components/subscription/subscription-view';
import { getMySubscription, ProfileFetchError } from '@/utils/api';

export default async function SubscriptionPage() {
  let subscription: Awaited<ReturnType<typeof getMySubscription>> | null = null;
  let error: string | null = null;

  try {
    subscription = await getMySubscription();
  } catch (err) {
    if (err instanceof ProfileFetchError && err.status === 404) {
      error = 'no_subscription';
    } else {
      error = err instanceof ProfileFetchError ? err.message : 'Failed to load subscription.';
    }
  }

  return <SubscriptionView subscription={subscription} error={error} />;
}
