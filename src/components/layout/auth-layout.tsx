import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AuthLayoutVariant = 'account' | 'onboarding' | 'register';

type AuthLayoutProps = {
  children: ReactNode;
  variant?: AuthLayoutVariant;
};

const shellClassName: Record<AuthLayoutVariant, string> = {
  account: 'items-center justify-center p-6',
  onboarding: 'items-center justify-center p-6',
  register: 'items-start justify-center px-4 py-6 sm:px-6 sm:py-8',
};

const cardClassName: Record<AuthLayoutVariant, string> = {
  account: 'max-w-[400px] rounded-3xl p-8 shadow-[0_24px_48px_-12px_rgba(43,24,101,0.35)] sm:p-10',
  onboarding: 'max-w-[640px] rounded-3xl p-8 shadow-[0_24px_48px_-12px_rgba(43,24,101,0.35)] sm:p-10',
  register: 'max-w-6xl rounded-2xl p-5 shadow-[0_16px_40px_-16px_rgba(43,24,101,0.28)] sm:p-6 lg:p-7',
};

export function AuthLayout({ children, variant = 'account' }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-dvh w-full flex-1 overflow-hidden bg-linear-to-br from-brand-deep from-0% via-brand via-60% to-[#6A71E6]',
        shellClassName[variant]
      )}
    >
      <div aria-hidden="true" className="absolute -top-10 -right-10 h-80 w-80 rounded-full bg-white/18 blur-[50px]" />
      <div
        aria-hidden="true"
        className="absolute -bottom-22 -left-15 h-70 w-70 rounded-full bg-motivation opacity-40 blur-[60px]"
      />
      <div className={cn('relative z-1 flex w-full flex-col bg-white', cardClassName[variant])}>{children}</div>
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
  register: '',
};

export function AuthCardBody({ children, variant = 'account', className }: AuthCardBodyProps) {
  return <div className={cn('flex flex-1 flex-col', bodyClassName[variant], className)}>{children}</div>;
}
