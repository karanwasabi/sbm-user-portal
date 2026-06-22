'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { changePassword } from '@/app/(portal)/profile/change-password/actions';
import { PasswordField } from '@/components/auth/password-field';
import { PASSWORD_REQUIREMENTS_COPY } from '@/lib/password-requirements';
import type { ChangePasswordField, ChangePasswordState } from '@/types/change-password';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { SecurityPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHead } from '@/components/ui/section-head';

const initialState: ChangePasswordState = { error: null, success: false };

const layoutProps = {
  eyebrow: 'Security',
  title: 'Protect Your Account',
  description: 'Choose a strong, unique password. You will stay signed in after updating.',
  illustration: <SecurityPageIllustration />,
  panelClassName: 'bg-gradient-to-br from-brand-deep via-brand to-brand-deep-press',
  glowClassName: 'bg-brand-glow/40',
  footer: PASSWORD_REQUIREMENTS_COPY,
};

function BackLink() {
  return (
    <Link
      href="/profile"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 no-underline hover:text-slate-700"
    >
      <ArrowLeft size={16} />
      Back to Profile
    </Link>
  );
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction, isPending] = useActionState(changePassword, initialState);
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [displayErrorFields, setDisplayErrorFields] = useState<ChangePasswordField[]>([]);
  const currentRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending) {
      setDisplayError(state.error);
      setDisplayErrorFields(state.errorFields ?? []);
      if (state.error && state.focusField) {
        const refs = {
          currentPassword: currentRef,
          newPassword: newRef,
          confirmPassword: confirmRef,
        } as const;
        refs[state.focusField].current?.focus();
      }
    }
    wasPending.current = isPending;
  }, [isPending, state.error, state.focusField, state.errorFields]);

  const clearError = () => {
    if (displayError) setDisplayError(null);
    if (displayErrorFields.length > 0) setDisplayErrorFields([]);
  };

  const fieldError = (field: ChangePasswordField) => displayErrorFields.includes(field);

  if (state.success) {
    return (
      <PortalPageLayout {...layoutProps}>
        <BackLink />
        <Card>
          <SectionHead title="Password Updated" subtitle="Your sign-in password has been changed." />
          <p className="text-sm leading-relaxed text-slate-600">
            Use your new password the next time you sign in on another device. This session stays active.
          </p>
          <Button variant="primary" size="md" className="mt-5" onClick={() => router.push('/profile')}>
            Return to Profile
          </Button>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout {...layoutProps}>
      <BackLink />
      <Card>
        <SectionHead title="Change Password" subtitle="Enter your current password, then choose a new one." />

        <form action={formAction} className="mt-4 flex flex-col gap-3.5">
          <PasswordField
            name="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={(value) => {
              setCurrentPassword(value);
              clearError();
            }}
            showPassword={showCurrent}
            onToggleShow={() => setShowCurrent(!showCurrent)}
            autoComplete="current-password"
            disabled={isPending}
            error={fieldError('currentPassword')}
            inputRef={currentRef}
            autoFocus
          />

          <PasswordField
            name="newPassword"
            label="New Password"
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value);
              clearError();
            }}
            showPassword={showNew}
            onToggleShow={() => setShowNew(!showNew)}
            autoComplete="new-password"
            disabled={isPending}
            error={fieldError('newPassword')}
            inputRef={newRef}
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              clearError();
            }}
            showPassword={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
            autoComplete="new-password"
            disabled={isPending}
            error={fieldError('confirmPassword')}
            inputRef={confirmRef}
          />

          <div className="min-h-6 py-0.5" role={displayError ? 'alert' : undefined} aria-live="polite">
            {displayError && (
              <p className="text-[12.5px] leading-snug font-semibold text-danger-press">{displayError}</p>
            )}
          </div>

          <Button type="submit" variant="primary" size="md" disabled={isPending} className="self-start">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </Card>
    </PortalPageLayout>
  );
}
