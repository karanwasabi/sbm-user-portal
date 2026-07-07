'use client';

import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { DPDP_PRIVACY_URL, DPDP_TERMS_URL } from '@/lib/dpdp-consent';
import { cn } from '@/lib/cn';
import type { Ref } from 'react';

type EnrollConsentCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  inputRef?: Ref<HTMLButtonElement>;
};

export function EnrollConsentCheckbox({ checked, onChange, disabled, error, inputRef }: EnrollConsentCheckboxProps) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3.5 py-3',
        error ? 'border-danger/40 bg-danger/5' : 'border-slate-200 bg-canvas-cool'
      )}
    >
      <Checkbox
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        inputRef={inputRef}
        label={
          <span className="text-[13px] leading-snug text-slate-700">
            I agree to{' '}
            <Link
              href={DPDP_TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand no-underline hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link
              href={DPDP_PRIVACY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand no-underline hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              Privacy Policy
            </Link>
            .
          </span>
        }
      />
      {error ? (
        <p className="mt-2 text-[11.5px] font-semibold text-danger-press" role="alert">
          You must accept the Terms and Privacy Policy to continue.
        </p>
      ) : null}
    </div>
  );
}
