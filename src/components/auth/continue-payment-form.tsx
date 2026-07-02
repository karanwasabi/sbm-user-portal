'use client';

import { ContinuePaymentRecovery } from '@/components/auth/continue-payment-recovery';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';

type ContinuePaymentFormProps = {
  initialEmail?: string;
};

export function ContinuePaymentForm({ initialEmail = '' }: ContinuePaymentFormProps) {
  return (
    <AuthLayout>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>
      <ContinuePaymentRecovery initialEmail={initialEmail} />
    </AuthLayout>
  );
}
