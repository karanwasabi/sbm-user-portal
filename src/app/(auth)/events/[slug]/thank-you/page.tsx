import type { Metadata } from 'next';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { EnrollWelcomeIllustration } from '@/components/enroll/enroll-welcome-illustration';
import { AuthLayout } from '@/components/layout/auth-layout';

export const metadata: Metadata = { title: "You're in!" };

export default function EventThankYouPage() {
  return (
    <AuthLayout variant="account">
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-4 py-2 text-center">
        <div className="flex w-full justify-center overflow-x-auto">
          <SbmWordmark size="lg" showSubtitle={false} />
        </div>
        <EnrollWelcomeIllustration className="my-1 h-auto w-full max-w-[280px] sm:max-w-[300px]" />
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">You’re in!</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            We’ve received your details and you’ll get a WhatsApp confirmation shortly. We’ll also send you a reminder
            an hour before and again 10 minutes before your slot so you don’t miss it.
          </p>
          <p className="text-sm font-semibold text-slate-900">See you at the workshop!</p>
        </div>
      </div>
    </AuthLayout>
  );
}
