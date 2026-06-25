import { LoginForm } from '@/components/auth/login-form';
import { normalizeLoginEmailParam } from '@/lib/login-url';

type LoginPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialEmail = normalizeLoginEmailParam(params.email);

  return <LoginForm initialEmail={initialEmail} />;
}
