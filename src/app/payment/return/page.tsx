import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { PaymentReturnView } from '@/components/checkout/payment-return-view';

type PaymentReturnPageProps = {
  searchParams: Promise<{ error?: string }>;
};

function PaymentReturnFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
    </div>
  );
}

export default async function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  const params = await searchParams;
  return (
    <Suspense fallback={<PaymentReturnFallback />}>
      <PaymentReturnView error={params.error ?? null} />
    </Suspense>
  );
}
