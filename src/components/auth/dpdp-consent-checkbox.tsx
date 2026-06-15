'use client';

import type { Ref } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { DPDP_PRIVACY_URL, DPDP_TERMS_URL } from '@/lib/dpdp-consent';
import { cn } from '@/lib/cn';

type DpdpConsentCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  inputRef?: Ref<HTMLButtonElement>;
};

export function DpdpConsentCheckbox({ checked, onChange, disabled, error, inputRef }: DpdpConsentCheckboxProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3.5',
        error ? 'border-danger/40 bg-danger/5' : 'border-slate-200 bg-canvas-cool'
      )}
      role="group"
      aria-labelledby="dpdp-consent-heading"
    >
      <p id="dpdp-consent-heading" className="text-[13px] font-bold text-slate-800">
        Data processing consent
      </p>
      <Checkbox
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        inputRef={inputRef}
        className="mt-3"
        label={
          <span className="text-[12.5px] leading-snug text-slate-700">
            I agree to the{' '}
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
            , and I consent to the collection and processing of my personal data in accordance with the Digital Personal
            Data Protection Act, 2023 (India).
          </span>
        }
      />
      {error ? (
        <p className="mt-2 text-[11.5px] font-semibold text-danger-press" role="alert">
          You must accept the Terms and Privacy Policy to create an account.
        </p>
      ) : null}
    </div>
  );
}
