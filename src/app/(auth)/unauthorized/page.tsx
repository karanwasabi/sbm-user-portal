import Link from 'next/link';
import { AuthLayout } from '@/components/layout/auth-layout';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { SectionHead } from '@/components/ui/section-head';

export default function UnauthorizedPage() {
  return (
    <AuthLayout>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>
      <SectionHead
        title="Access not available"
        subtitle="Your account does not have access to the member portal. If you believe this is a mistake, contact support."
        className="mb-6"
      />
      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-bold text-white no-underline"
        >
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
