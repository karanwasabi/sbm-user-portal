import { WelcomeRenewView } from '@/components/renew/welcome-renew-view';

type PageProps = {
  searchParams: Promise<{ session?: string }>;
};

export default async function WelcomeRenewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session?.trim() || undefined;
  return <WelcomeRenewView sessionId={sessionId} />;
}
