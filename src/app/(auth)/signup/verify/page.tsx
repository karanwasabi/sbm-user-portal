import { redirect } from 'next/navigation';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { SIGNUP_EMAIL_COOKIE } from '@/types/signup';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function VerifySignupPage() {
  const cookieStore = await cookies();
  const cookieEmail = cookieStore.get(SIGNUP_EMAIL_COOKIE)?.value?.trim().toLowerCase();

  let email = cookieEmail ?? '';

  if (!email) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email?.trim().toLowerCase() ?? '';
  }

  if (!email) {
    redirect('/signup');
  }

  return <VerifyEmailForm email={email} />;
}
