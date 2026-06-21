'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { setInitialPassword } from '@/app/(auth)/register/actions';
import { PasswordField } from '@/components/auth/password-field';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { SecurityPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHead } from '@/components/ui/section-head';
import { PASSWORD_REQUIREMENTS_COPY } from '@/lib/password-requirements';

const initialState = { error: null as string | null, success: false };

const layoutProps = {
  eyebrow: 'Security',
  title: 'Protect your account',
  description: 'Choose a strong password for email sign-in. You will stay signed in after saving.',
  illustration: <SecurityPageIllustration />,
  panelClassName: 'bg-gradient-to-br from-brand-deep via-brand to-brand-deep-press',
  glowClassName: 'bg-brand-glow/40',
  footer: PASSWORD_REQUIREMENTS_COPY,
};

export function SetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction, isPending] = useActionState(setInitialPassword, initialState);
  const newRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    newRef.current?.focus();
  }, []);

  if (state.success) {
    return (
      <PortalPageLayout {...layoutProps}>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 no-underline hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          Back to profile
        </Link>
        <Card>
          <SectionHead title="Password saved" subtitle="You can now sign in with your email and password." />
          <Button variant="primary" size="md" className="mt-5" href="/">
            Go to dashboard
          </Button>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout {...layoutProps}>
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 no-underline hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Back to profile
      </Link>
      <Card>
        <SectionHead title="Set password" subtitle="No current password is required for your account." />
        <form action={formAction} className="mt-4 flex flex-col gap-3.5">
          <PasswordField
            name="newPassword"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            showPassword={showNew}
            onToggleShow={() => setShowNew(!showNew)}
            autoComplete="new-password"
            disabled={isPending}
            error={false}
            inputRef={newRef}
          />
          <PasswordField
            name="confirmPassword"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            showPassword={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
            autoComplete="new-password"
            disabled={isPending}
            error={false}
          />
          {state.error ? (
            <p className="text-[12.5px] font-semibold text-danger-press" role="alert">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" variant="primary" size="md" disabled={isPending} className="self-start">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save password'
            )}
          </Button>
        </form>
      </Card>
    </PortalPageLayout>
  );
}
