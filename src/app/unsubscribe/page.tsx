import { UnsubscribeView } from '@/components/email/unsubscribe-view';

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token?.trim() || null;
  return <UnsubscribeView token={token} />;
}
