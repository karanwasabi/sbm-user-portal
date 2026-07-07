import { WelcomeTakeControlView } from '@/components/enroll/welcome-take-control-view';

type PageProps = {
  searchParams: Promise<{ product?: string; session?: string }>;
};

export default async function WelcomeTakeControlPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session?.trim() ?? '';
  return <WelcomeTakeControlView sessionId={sessionId || undefined} />;
}
