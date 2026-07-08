import { loadRegisterPage } from '@/app/(auth)/register/_lib/load-register-page';

type SubscribePageProps = {
  searchParams: Promise<{ verified?: string }>;
};

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const params = await searchParams;
  return loadRegisterPage({ assisted: false, searchParams: params, registerPath: '/subscribe' });
}
