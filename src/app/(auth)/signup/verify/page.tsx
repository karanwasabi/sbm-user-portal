import { redirect } from 'next/navigation';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { SIGNUP_EMAIL_COOKIE } from '@/types/signup';
import { cookies } from 'next/headers';

type VerifySignupPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifySignupPage({ searchParams }: VerifySignupPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieEmail = cookieStore.get(SIGNUP_EMAIL_COOKIE)?.value;
  const email = (params.email ?? cookieEmail ?? '').trim().toLowerCase();

  if (!email) {
    redirect('/signup');
  }

  return <VerifyEmailForm email={email} />;
}
