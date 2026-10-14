'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { EnrollConsentCheckbox } from '@/components/enroll/enroll-consent-checkbox';
import { AuthLayout } from '@/components/layout/auth-layout';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { cn } from '@/lib/cn';
import { readAttributionPayloadForApi } from '@/lib/attribution-payload';
import { isValidEmailFormat } from '@/lib/email-validation';
import { combineWhatsapp, formatPhoneE164, parseWhatsapp } from '@/lib/phone-number';
import { toTitleCase } from '@/lib/title-case';
import { captureUtmAttributionFromLocation } from '@/lib/utm-attribution';
import { validateWhatsappNumber } from '@/lib/whatsapp-validation';
import { postEventCheckEmail, postEventSubmit } from '@/utils/client-api';
import type { EventCheckEmailResponse, PublicEvent, PublicEventSlot } from '@/types/event';
import type { Country } from '@/types/reference';

type EventSignupViewProps = {
  event: PublicEvent;
  countries: Country[];
  suggestedCountryIso?: string;
  initialEmail?: string;
};

function SlotOption({
  slot,
  selected,
  disabled,
  onSelect,
}: {
  slot: PublicEventSlot;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors',
        selected ? 'border-brand bg-brand/5' : 'border-slate-200 bg-background hover:border-slate-300',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <input
        type="radio"
        name="slot"
        value={slot.id}
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
        className="h-4 w-4 shrink-0 accent-brand"
      />
      <span className="min-w-0 text-sm font-semibold text-slate-900">{slot.label}</span>
    </label>
  );
}

export function EventSignupView({ event, countries, suggestedCountryIso, initialEmail }: EventSignupViewProps) {
  const router = useRouter();
  const defaultIso = suggestedCountryIso ?? 'IN';

  const [email, setEmail] = useState(initialEmail?.trim().toLowerCase() ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [known, setKnown] = useState<boolean | null>(null);
  const [profileLocked, setProfileLocked] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(true);
  const [emailChecked, setEmailChecked] = useState(false);
  const checkedEmailRef = useRef('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dialIso, setDialIso] = useState(defaultIso);
  const dialIsoRef = useRef(defaultIso);
  const [phoneSyncToken, setPhoneSyncToken] = useState(0);

  const [slotId, setSlotId] = useState('');
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const initialCheckDoneRef = useRef(false);

  useEffect(() => {
    captureUtmAttributionFromLocation();
  }, []);

  const handleDialIsoChange = useCallback((iso: string) => {
    dialIsoRef.current = iso;
    setDialIso(iso);
  }, []);

  const clearProfileState = () => {
    setKnown(null);
    setProfileLocked(false);
    setNeedsConsent(true);
    setEmailChecked(false);
    setDpdpConsent(false);
    setConsentError(false);
  };

  const applyKnownProfile = (result: EventCheckEmailResponse) => {
    if (result.first_name) setFirstName(result.first_name);
    if (result.last_name) setLastName(result.last_name);
    if (result.phone) {
      const parsed = parseWhatsapp(result.phone, result.country_code ?? dialIsoRef.current);
      setPhone(result.phone);
      if (parsed.dialIso) {
        dialIsoRef.current = parsed.dialIso;
        setDialIso(parsed.dialIso);
      }
      setPhoneSyncToken((token) => token + 1);
    } else if (result.country_code) {
      dialIsoRef.current = result.country_code;
      setDialIso(result.country_code);
    }
  };

  const runEmailCheck = useCallback(
    async (rawEmail: string) => {
      const trimmed = rawEmail.trim().toLowerCase();
      if (!trimmed) {
        setEmailError(null);
        return;
      }
      if (!isValidEmailFormat(trimmed)) {
        setEmailError('That doesn’t look like a valid email.');
        return;
      }
      setEmailError(null);
      if (trimmed === checkedEmailRef.current && emailChecked) return;

      setCheckingEmail(true);
      try {
        const result = await postEventCheckEmail(event.slug, trimmed);
        checkedEmailRef.current = trimmed;
        setKnown(result.known);
        setProfileLocked(Boolean(result.known && result.profile_locked));
        setNeedsConsent(!result.has_dpdp_consent);
        setEmailChecked(true);
        setDpdpConsent(false);
        setConsentError(false);
        if (result.known) {
          applyKnownProfile(result);
        }
      } catch {
        clearProfileState();
      } finally {
        setCheckingEmail(false);
      }
    },
    [emailChecked, event.slug]
  );

  useEffect(() => {
    if (initialCheckDoneRef.current) return;
    const seed = initialEmail?.trim().toLowerCase();
    if (!seed || !isValidEmailFormat(seed)) return;
    initialCheckDoneRef.current = true;
    void runEmailCheck(seed);
  }, [initialEmail, runEmailCheck]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const normalized = value.trim().toLowerCase();
    if (checkedEmailRef.current && normalized !== checkedEmailRef.current) {
      checkedEmailRef.current = '';
      clearProfileState();
      setFirstName('');
      setLastName('');
      setPhone('');
      setPhoneSyncToken((token) => token + 1);
    }
    if (!normalized) setEmailError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmailFormat(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    if (!emailChecked || checkedEmailRef.current !== trimmedEmail) {
      await runEmailCheck(trimmedEmail);
      // Re-read after check: if still not checked, stop.
      if (checkedEmailRef.current !== trimmedEmail) {
        setFormError('Could not verify your email. Please try again.');
        return;
      }
    }

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst) {
      setFormError('Enter your first name.');
      return;
    }
    if (!trimmedLast) {
      setFormError('Enter your last name.');
      return;
    }

    let phoneE164 = '';
    if (phone.trim()) {
      const phoneError = validateWhatsappNumber(phone, dialIso);
      if (phoneError) {
        setFormError(phoneError);
        return;
      }
      const parsed = parseWhatsapp(phone, dialIso);
      phoneE164 = formatPhoneE164(
        combineWhatsapp(parsed.dialCode, parsed.nationalNumber, parsed.dialIso || dialIso),
        dialIso
      );
    } else if (!profileLocked) {
      setFormError(validateWhatsappNumber(phone, dialIso) || 'Enter your WhatsApp number.');
      return;
    }

    if (!slotId) {
      setFormError('Select a time slot.');
      return;
    }
    if (needsConsent && !dpdpConsent) {
      setConsentError(true);
      return;
    }

    setSubmitting(true);
    try {
      const attribution = readAttributionPayloadForApi() ?? {};
      await postEventSubmit(event.slug, {
        email: trimmedEmail,
        first_name: toTitleCase(trimmedFirst),
        last_name: toTitleCase(trimmedLast),
        ...(phoneE164 ? { phone: phoneE164, country_code: dialIso } : {}),
        slot_id: slotId,
        dpdp_consent: needsConsent ? dpdpConsent : true,
        website,
        ...attribution,
      });
      router.push(`/events/${encodeURIComponent(event.slug)}/thank-you`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not complete your registration. Please try again.');
      setSubmitting(false);
    }
  };

  const fieldsDisabled = submitting || profileLocked;

  return (
    <AuthLayout variant="account">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="mx-auto flex w-full max-w-[420px] flex-col gap-5 py-2"
      >
        <div className="text-center">
          <div className="mb-5 flex justify-center overflow-x-auto">
            <SbmWordmark size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{event.name}</h1>
          {event.description ? (
            <p className="mt-1 text-sm whitespace-pre-line text-slate-600">{event.description}</p>
          ) : null}
        </div>

        <div className="space-y-3.5">
          <Field label="Email" error={emailError}>
            <TextInput
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              onBlur={() => void runEmailCheck(email)}
              error={Boolean(emailError)}
              disabled={submitting}
            />
            {checkingEmail ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking your details…
              </p>
            ) : null}
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="First name">
              <TextInput
                value={firstName}
                onChange={setFirstName}
                autoComplete="given-name"
                disabled={fieldsDisabled}
              />
            </Field>
            <Field label="Last name">
              <TextInput value={lastName} onChange={setLastName} autoComplete="family-name" disabled={fieldsDisabled} />
            </Field>
          </div>

          <Field label="WhatsApp">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              countries={countries}
              suggestedCountryIso={suggestedCountryIso}
              preferredDialIso={dialIso}
              syncToken={phoneSyncToken}
              onDialIsoChange={handleDialIsoChange}
              disabled={fieldsDisabled}
              className="flex-col sm:flex-row sm:items-start"
              dialCodeClassName="w-full sm:w-35 sm:shrink-0"
              mobileClassName="w-full sm:flex-1"
            />
          </Field>

          <fieldset className="space-y-2">
            <legend className="pl-0.5 text-[12.5px] font-semibold text-slate-700">Choose a slot</legend>
            {event.slots.length > 0 ? (
              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Time slot">
                {event.slots.map((slot) => (
                  <SlotOption
                    key={slot.id}
                    slot={slot}
                    selected={slotId === slot.id}
                    disabled={submitting}
                    onSelect={() => setSlotId(slot.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No slots are available right now. Please check back soon.</p>
            )}
          </fieldset>

          {/* Honeypot: hidden from users and assistive tech; bots tend to fill it. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          {emailChecked && needsConsent ? (
            <EnrollConsentCheckbox
              checked={dpdpConsent}
              onChange={(checked) => {
                setDpdpConsent(checked);
                if (checked) setConsentError(false);
              }}
              error={consentError}
            />
          ) : null}

          {formError ? (
            <p className="text-[12.5px] font-semibold text-danger-press" role="alert">
              {formError}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={submitting || event.slots.length === 0 || checkingEmail}
          rightIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        >
          {submitting ? 'Registering…' : 'Register'}
        </Button>
      </form>
    </AuthLayout>
  );
}
