import { ContinuePaymentForm } from '@/components/auth/continue-payment-form';
import { normalizeLoginEmailParam } from '@/lib/login-url';

type ContinuePaymentPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ContinuePaymentPage({ searchParams }: ContinuePaymentPageProps) {
  const params = await searchParams;
  const initialEmail = normalizeLoginEmailParam(params.email);

  return <ContinuePaymentForm initialEmail={initialEmail} />;
}
