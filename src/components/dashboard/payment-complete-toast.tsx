'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { PAYMENT_COMPLETE_QUERY_PARAM } from '@/lib/payment-complete';

export function PaymentCompleteToast() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get(PAYMENT_COMPLETE_QUERY_PARAM) !== '1') return;

    toast({
      message: 'Your payment is already complete.',
      variant: 'success',
      durationMs: 6000,
    });

    const url = new URL(window.location.href);
    url.searchParams.delete(PAYMENT_COMPLETE_QUERY_PARAM);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [searchParams, toast]);

  return null;
}
