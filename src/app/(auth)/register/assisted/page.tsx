import { loadRegisterPage } from '@/app/(auth)/register/_lib/load-register-page';

type AssistedRegisterPageProps = {
  searchParams: Promise<{ verified?: string }>;
};

export default async function AssistedRegisterPage({ searchParams }: AssistedRegisterPageProps) {
  const params = await searchParams;
  return loadRegisterPage({ assisted: true, searchParams: params });
}
