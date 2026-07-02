import { loadRegisterPage } from '@/app/(auth)/register/_lib/load-register-page';

type RegisterPageProps = {
  searchParams: Promise<{ verified?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  return loadRegisterPage({ assisted: false, searchParams: params });
}
