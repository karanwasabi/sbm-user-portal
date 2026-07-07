import { WelcomeTakeControlView } from '@/components/enroll/welcome-take-control-view';

type PageProps = {
  searchParams: Promise<{ product?: string; session?: string }>;
};

export default async function WelcomeTakeControlPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const product = params.product?.trim() ?? '';
  const sessionId = params.session?.trim() ?? '';
  const productLabel = product === 'trial_3m' ? '3-month' : 'trial';

  return <WelcomeTakeControlView sessionId={sessionId || undefined} productLabel={productLabel} />;
}
