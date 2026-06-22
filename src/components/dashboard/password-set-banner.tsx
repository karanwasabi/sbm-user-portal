import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function PasswordSetBanner() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Set a Password</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            You signed in with a one-time code. Add a password so you can sign in with email next time.
          </p>
        </div>
        <Link
          href="/profile/set-password"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-press focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          Set Password
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
