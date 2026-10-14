import type { Metadata } from 'next';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { EnrollWelcomeIllustration } from '@/components/enroll/enroll-welcome-illustration';
import { AuthLayout } from '@/components/layout/auth-layout';
import { fetchPublicEvent } from '@/utils/api';

type ThankYouPageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = { title: "You're registered" };

export default async function EventThankYouPage({ params }: ThankYouPageProps) {
  const { slug } = await params;
  const event = await fetchPublicEvent(slug);

  return (
    <AuthLayout variant="account">
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-4 py-2 text-center">
        <div className="flex w-full justify-center overflow-x-auto">
          <SbmWordmark size="lg" showSubtitle={false} />
        </div>
        <EnrollWelcomeIllustration className="my-1 h-auto w-full max-w-[280px] sm:max-w-[300px]" />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">You&apos;re registered</h1>
          <p className="text-sm text-slate-600">
            {event ? (
              <>
                Thanks for signing up for <span className="font-semibold text-slate-900">{event.name}</span>.
              </>
            ) : (
              'Thanks for signing up.'
            )}{' '}
            Check your inbox for a confirmation with the details.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
