import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AuthLayoutVariant = 'account' | 'onboarding';

type AuthLayoutProps = {
  children: ReactNode;
  variant?: AuthLayoutVariant;
};

const cardClassName: Record<AuthLayoutVariant, string> = {
  account: 'max-w-[400px]',
  onboarding: 'max-w-[640px]',
};

export function AuthLayout({ children, variant = 'account' }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh w-full flex-1 items-center justify-center overflow-hidden bg-linear-to-br from-brand-deep from-0% via-brand via-60% to-[#6A71E6] p-6">
      <div aria-hidden="true" className="absolute -top-10 -right-10 h-80 w-80 rounded-full bg-white/18 blur-[50px]" />
      <div
        aria-hidden="true"
        className="absolute -bottom-22 -left-15 h-70 w-70 rounded-full bg-motivation opacity-40 blur-[60px]"
      />
      <div
        className={cn(
          'relative z-1 flex w-full flex-col rounded-3xl bg-white p-8 shadow-[0_24px_48px_-12px_rgba(43,24,101,0.35)] sm:p-10',
          cardClassName[variant]
        )}
      >
        {children}
      </div>
    </div>
  );
}

type AuthCardBodyProps = {
  children: ReactNode;
  variant?: AuthLayoutVariant;
  className?: string;
};

const bodyClassName: Record<AuthLayoutVariant, string> = {
  account: '',
  onboarding: '',
};

export function AuthCardBody({ children, variant = 'account', className }: AuthCardBodyProps) {
  return <div className={cn('flex flex-1 flex-col', bodyClassName[variant], className)}>{children}</div>;
}
