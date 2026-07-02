import { LoginAuthHashHandler } from '@/components/auth/login-auth-hash-handler';
import { LoginForm } from '@/components/auth/login-form';
import { normalizeLoginEmailParam } from '@/lib/login-url';

type LoginPageProps = {
  searchParams: Promise<{ email?: string; link_error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialEmail = normalizeLoginEmailParam(params.email);
  const linkError = params.link_error === 'expired' ? 'expired' : null;

  return (
    <LoginAuthHashHandler>
      <LoginForm initialEmail={initialEmail} linkError={linkError} />
    </LoginAuthHashHandler>
  );
}
