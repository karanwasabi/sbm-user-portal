'use client';

import { Phone } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { DialCodePicker } from '@/components/profile/dial-code-picker';
import { TextInput } from '@/components/ui/text-input';
import { getMobileDigitHint, sanitizeNationalDigits, validateMobileNational } from '@/lib/country-mobile-rules';
import { getCountryDialCode } from '@/lib/country-dial-codes';
import { combineWhatsapp, parseWhatsapp } from '@/lib/phone-number';
import { cn } from '@/lib/utils';
import type { Country } from '@/types/reference';

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Fires when the dial-code country changes (independent of number validity). */
  onDialIsoChange?: (iso: string) => void;
  countries: Country[];
  /** When the combined number is blank, auto-fill dial code from this country. */
  suggestedCountryIso?: string;
  /** Explicit dial-country selection (e.g. US for +1). Used when parsing shared dial codes. */
  preferredDialIso?: string;
  /** Bumped to force internal state to re-sync from `value` (e.g. form discard). */
  syncToken?: number;
  name?: string;
  disabled?: boolean;
  className?: string;
  dialCodeClassName?: string;
  mobileClassName?: string;
  error?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  /** When true, feedback renders in the wrapping Field instead of below the mobile input. */
  useFieldFeedback?: boolean;
};

function initialParts(value: string, preferredIso?: string) {
  const parsed = parseWhatsapp(value, preferredIso);
  if (!value.trim() && preferredIso) {
    const dial = getCountryDialCode(preferredIso);
    if (dial) {
      return { dialCode: dial, dialIso: preferredIso, nationalNumber: '' };
    }
  }
  if (parsed.dialIso && parsed.nationalNumber) {
    return {
      ...parsed,
      nationalNumber: sanitizeNationalDigits(parsed.nationalNumber, parsed.dialIso),
    };
  }
  return parsed;
}

function resolvePreferredIso(
  preferredDialIso: string | undefined,
  suggestedCountryIso: string | undefined,
  currentDialIso: string
): string | undefined {
  return preferredDialIso || currentDialIso || suggestedCountryIso;
}

function applyValueToParts(
  value: string,
  preferredIso: string | undefined,
  setters: {
    setDialCode: (v: string) => void;
    setDialIso: (v: string) => void;
    setNationalNumber: (v: string) => void;
  },
  refs: {
    lastEmitted: { current: string };
    lastPreferredIso: { current: string | undefined };
  }
) {
  refs.lastEmitted.current = value;
  refs.lastPreferredIso.current = preferredIso;
  const next = initialParts(value, preferredIso);
  setters.setDialCode(next.dialCode);
  setters.setDialIso(next.dialIso);
  setters.setNationalNumber(next.nationalNumber);
}

export function PhoneInput({
  value,
  onChange,
  onDialIsoChange,
  countries,
  suggestedCountryIso,
  preferredDialIso,
  syncToken,
  name,
  disabled,
  className,
  dialCodeClassName = 'w-35 shrink-0',
  mobileClassName,
  error = false,
  inputRef,
  useFieldFeedback = false,
}: PhoneInputProps) {
  const initialPreferredIso = resolvePreferredIso(preferredDialIso, suggestedCountryIso, '');
  const initial = initialParts(value, initialPreferredIso);
  const [dialCode, setDialCode] = useState(initial.dialCode);
  const [dialIso, setDialIso] = useState(initial.dialIso);
  const [nationalNumber, setNationalNumber] = useState(initial.nationalNumber);
  const lastEmitted = useRef(value);
  const lastPreferredIso = useRef(initialPreferredIso);
  const lastSyncToken = useRef(syncToken);
  const dialIsoRef = useRef(dialIso);
  dialIsoRef.current = dialIso;

  useEffect(() => {
    if (!dialIso) return;
    onDialIsoChange?.(dialIso);
  }, [dialIso, onDialIsoChange]);

  useEffect(() => {
    const preferredIso = resolvePreferredIso(preferredDialIso, suggestedCountryIso, dialIsoRef.current);

    if (syncToken !== undefined && syncToken !== lastSyncToken.current) {
      lastSyncToken.current = syncToken;
      applyValueToParts(
        value,
        preferredIso,
        { setDialCode, setDialIso, setNationalNumber },
        { lastEmitted, lastPreferredIso }
      );
      return;
    }

    if (value === lastEmitted.current) {
      if (!value.trim() && suggestedCountryIso && suggestedCountryIso !== lastPreferredIso.current) {
        lastPreferredIso.current = suggestedCountryIso;
        const dial = getCountryDialCode(suggestedCountryIso);
        if (dial) {
          setDialCode(dial);
          setDialIso(suggestedCountryIso);
        }
      }
      return;
    }

    // Parent has not applied a clear emit yet; avoid restoring a stale saved number.
    if (!lastEmitted.current.trim() && value.trim()) {
      return;
    }

    lastEmitted.current = value;
    lastPreferredIso.current = preferredIso;
    const next = initialParts(value, preferredIso);
    setDialCode(next.dialCode);
    setDialIso(next.dialIso);
    setNationalNumber(next.nationalNumber);
  }, [value, suggestedCountryIso, preferredDialIso, syncToken]);

  const digitHint = useMemo(() => getMobileDigitHint(dialIso), [dialIso]);
  const validationError = useMemo(() => {
    // Parent `error` means submit/server validation — Field shows that message.
    if (error) return null;
    if (!nationalNumber) return null;
    return validateMobileNational(nationalNumber, dialIso);
  }, [error, nationalNumber, dialIso]);

  const updateCombined = (nextDial: string, nextIso: string, nextNational: string) => {
    const sanitized = nextIso ? sanitizeNationalDigits(nextNational, nextIso) : nextNational.replace(/\D/g, '');
    setDialCode(nextDial);
    setDialIso(nextIso);
    setNationalNumber(sanitized);
    const combined = combineWhatsapp(nextDial, sanitized, nextIso);
    lastEmitted.current = combined;
    onChange(combined);
  };

  const combinedValue = combineWhatsapp(dialCode, nationalNumber, dialIso);

  return (
    <div className={cn('flex w-full items-start gap-2', className)}>
      <DialCodePicker
        dialIso={dialIso}
        onChange={({ dialCode: nextDial, dialIso: nextIso }) => {
          const sanitized = sanitizeNationalDigits(nationalNumber, nextIso);
          updateCombined(nextDial, nextIso, sanitized);
        }}
        countries={countries}
        disabled={disabled}
        className={dialCodeClassName}
        error={error}
      />
      <div className={cn('flex min-w-0 flex-col gap-1.5', mobileClassName ?? 'flex-1')}>
        <TextInput
          ref={inputRef}
          value={nationalNumber}
          onChange={(nextNational) => {
            updateCombined(dialCode, dialIso, nextNational);
          }}
          placeholder="Mobile number"
          disabled={disabled}
          inputMode="tel"
          autoComplete="tel-national"
          error={error || Boolean(validationError)}
          leftIcon={<Phone size={16} className="text-slate-400" />}
        />
        {!useFieldFeedback || digitHint || validationError ? (
          <div className="min-h-[18px]">
            <p
              className={cn(
                'pl-0.5 text-[11.5px] leading-[18px]',
                validationError
                  ? 'font-semibold text-destructive'
                  : digitHint
                    ? 'font-medium text-muted-foreground'
                    : 'invisible'
              )}
              aria-live="polite"
            >
              {validationError ?? digitHint ?? 'Enter digits without the country code.'}
            </p>
          </div>
        ) : null}
        {name ? <input type="hidden" name={name} value={combinedValue} /> : null}
      </div>
    </div>
  );
}
