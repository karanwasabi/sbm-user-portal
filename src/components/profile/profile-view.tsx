'use client';

import { Cake, Loader2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { loadCountryCities, updateProfile } from '@/app/(portal)/profile/actions';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { ProfilePageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { CityCombobox } from '@/components/profile/city-combobox';
import { CountryCombobox } from '@/components/profile/country-combobox';
import { MealPreferenceSelect } from '@/components/profile/meal-preference-select';
import { ParentalConsentBlock } from '@/components/profile/parental-consent-block';
import { ProfileCompletionRing } from '@/components/profile/profile-completion-ring';
import { PhoneInput } from '@/components/profile/phone-input';
import { SexSelect } from '@/components/profile/sex-select';
import { TimezonePicker } from '@/components/profile/timezone-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Field } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import { useLocationFields } from '@/hooks/use-location-fields';
import {
  getDateOfBirthInputBounds,
  isParentalConsentValidationError,
  shouldShowParentalConsent,
  validateDateOfBirth,
} from '@/lib/date-of-birth';
import { getProfileCompletionPercentFromValues } from '@/lib/profile-completion';
import { formatTimezoneLabel } from '@/lib/profile-timezone';
import { toTitleCase } from '@/lib/title-case';
import {
  getFullName,
  getInitials,
  type MealPreference,
  type Profile,
  type Sex,
  type UpdateProfileState,
} from '@/types/profile';
import type { Country } from '@/types/reference';

const initialState: UpdateProfileState = { error: null, success: false };

type ProfileFormSnapshot = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex | '';
  timezoneId: string;
  countryCode: string;
  city: string;
  mealPreference: MealPreference | '';
  whatsapp: string;
  parentalConsent: boolean;
};

function snapshotFromProfile(profile: Profile | null | undefined): ProfileFormSnapshot {
  return {
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    dateOfBirth: profile?.date_of_birth ?? '',
    sex: profile?.sex ?? '',
    timezoneId: profile?.timezone_id ?? '',
    countryCode: profile?.country_code ?? '',
    city: profile?.city ?? '',
    mealPreference: profile?.meal_preference ?? '',
    whatsapp: profile?.whatsapp ?? '',
    parentalConsent: profile?.parental_consent ?? false,
  };
}

function snapshotsEqual(a: ProfileFormSnapshot, b: ProfileFormSnapshot): boolean {
  return (
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.dateOfBirth === b.dateOfBirth &&
    a.sex === b.sex &&
    a.timezoneId === b.timezoneId &&
    a.countryCode === b.countryCode &&
    a.city === b.city &&
    a.mealPreference === b.mealPreference &&
    a.whatsapp === b.whatsapp &&
    a.parentalConsent === b.parentalConsent
  );
}

type ProfileViewProps = {
  countries: Country[];
};

export function ProfileView({ countries }: ProfileViewProps) {
  const router = useRouter();
  const { profile } = usePortalProfile();
  const { toast } = useToast();
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const [, startTransition] = useTransition();

  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth ?? '');
  const [sex, setSex] = useState<Sex | ''>(profile?.sex ?? '');
  const [timezoneId, setTimezoneId] = useState(profile?.timezone_id ?? '');
  const [countryCode, setCountryCode] = useState(profile?.country_code ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [mealPreference, setMealPreference] = useState<MealPreference | ''>(profile?.meal_preference ?? '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '');
  const [parentalConsent, setParentalConsent] = useState(profile?.parental_consent ?? false);
  const [savedSnapshot, setSavedSnapshot] = useState<ProfileFormSnapshot>(() => snapshotFromProfile(profile));
  const [phoneSyncToken, setPhoneSyncToken] = useState(0);
  const formSnapshotRef = useRef<ProfileFormSnapshot>(snapshotFromProfile(profile));

  const { citySuggestions, loadingCities, handleCountryChange, handleCitySuggestion } = useLocationFields({
    countries,
    countryCode,
    setCountryCode,
    setTimezoneId,
  });

  const email = profile?.email ?? '';
  const fullName = profile ? getFullName(profile) : 'Member';
  const initials = profile ? getInitials(profile) : 'SB';

  const timezoneHighlight = timezoneId
    ? (formatTimezoneLabel(timezoneId).split(' (')[1]?.replace(')', '') ?? 'Set')
    : 'Not set';

  useEffect(() => {
    if (!profile) return;
    const snapshot = snapshotFromProfile(profile);
    setSavedSnapshot(snapshot);
    setFirstName(snapshot.firstName);
    setLastName(snapshot.lastName);
    setDateOfBirth(snapshot.dateOfBirth);
    setSex(snapshot.sex);
    setTimezoneId(snapshot.timezoneId);
    setCountryCode(snapshot.countryCode);
    setCity(snapshot.city);
    setMealPreference(snapshot.mealPreference);
    setWhatsapp(snapshot.whatsapp);
    setParentalConsent(snapshot.parentalConsent);
  }, [profile]);

  const dateOfBirthBounds = useMemo(() => getDateOfBirthInputBounds(), []);
  const showParentalConsent = useMemo(() => shouldShowParentalConsent(dateOfBirth), [dateOfBirth]);
  const dateOfBirthError = useMemo(
    () => validateDateOfBirth(dateOfBirth, parentalConsent),
    [dateOfBirth, parentalConsent]
  );

  const handleDateOfBirthChange = (nextDateOfBirth: string) => {
    setDateOfBirth(nextDateOfBirth);
    if (nextDateOfBirth !== savedSnapshot.dateOfBirth) {
      setParentalConsent(false);
    }
  };

  formSnapshotRef.current = {
    firstName,
    lastName,
    dateOfBirth,
    sex,
    timezoneId,
    countryCode,
    city,
    mealPreference,
    whatsapp,
    parentalConsent,
  };

  useEffect(() => {
    if (!state.success) return;
    setSavedSnapshot(formSnapshotRef.current);
    toast({ message: 'Profile saved', variant: 'success' });
    startTransition(() => router.refresh());
  }, [state, router, startTransition, toast]);

  const resetForm = () => {
    setFirstName(savedSnapshot.firstName);
    setLastName(savedSnapshot.lastName);
    setDateOfBirth(savedSnapshot.dateOfBirth);
    setSex(savedSnapshot.sex);
    setTimezoneId(savedSnapshot.timezoneId);
    setCountryCode(savedSnapshot.countryCode);
    setCity(savedSnapshot.city);
    setMealPreference(savedSnapshot.mealPreference);
    setWhatsapp(savedSnapshot.whatsapp);
    setParentalConsent(savedSnapshot.parentalConsent);
    setPhoneSyncToken((token) => token + 1);
  };

  const isDirty = useMemo(() => {
    const currentSnapshot: ProfileFormSnapshot = {
      firstName,
      lastName,
      dateOfBirth,
      sex,
      timezoneId,
      countryCode,
      city,
      mealPreference,
      whatsapp,
      parentalConsent,
    };

    return !snapshotsEqual(currentSnapshot, savedSnapshot);
  }, [
    savedSnapshot,
    firstName,
    lastName,
    dateOfBirth,
    sex,
    timezoneId,
    countryCode,
    city,
    mealPreference,
    whatsapp,
    parentalConsent,
  ]);

  const canSave = isDirty && !dateOfBirthError;

  const completionPercent = useMemo(
    () =>
      getProfileCompletionPercentFromValues({
        first_name: firstName,
        last_name: lastName,
        email,
        date_of_birth: dateOfBirth,
        sex,
        timezone_id: timezoneId,
        country_code: countryCode,
        city,
        meal_preference: mealPreference,
        whatsapp,
        parental_consent: parentalConsent,
      }),
    [
      firstName,
      lastName,
      email,
      dateOfBirth,
      sex,
      timezoneId,
      countryCode,
      city,
      mealPreference,
      whatsapp,
      parentalConsent,
    ]
  );

  return (
    <PortalPageLayout
      eyebrow="Account"
      title={fullName}
      description="Keep your contact and program details up to date so your coach can personalise your experience."
      illustration={<ProfilePageIllustration />}
      panelClassName="bg-gradient-to-br from-lilac via-[#B794F6] to-brand-deep"
      glowClassName="bg-white/35"
      highlights={[
        { label: 'Status', value: 'Active' },
        { label: 'Member Since', value: 'Sep 2025' },
        { label: 'Timezone', value: timezoneHighlight },
      ]}
    >
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[18px]">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-brand-deep to-motivation text-[26px] font-extrabold tracking-wide text-white shadow-[0_10px_20px_-8px_rgba(92,101,207,0.40)]">
            {initials}
          </div>
          <div className="flex-1">
            <Eyebrow>Member Since · Sep 13, 2025</Eyebrow>
            <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{fullName}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-xs font-medium text-slate-500">
              {email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400" />
                  {email}
                </span>
              )}
              <Pill tone="success">Active Member</Pill>
            </div>
          </div>
          <ProfileCompletionRing percent={completionPercent} className="self-start sm:self-center" />
        </div>
      </Card>

      <Card>
        <SectionHead title="Personal Details" subtitle="Used to personalise your program experience." />
        <form
          action={formAction}
          onSubmit={(event) => {
            if (dateOfBirthError) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="timezoneId" value={timezoneId} />
          <input type="hidden" name="sex" value={sex} />
          <input type="hidden" name="mealPreference" value={mealPreference} />
          <input type="hidden" name="countryCode" value={countryCode} />
          <input type="hidden" name="city" value={city} />
          <input type="hidden" name="parentalConsent" value={parentalConsent ? 'true' : 'false'} />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="First Name">
              <TextInput
                name="firstName"
                value={firstName}
                onChange={(value) => setFirstName(toTitleCase(value))}
                placeholder="First name"
                disabled={pending}
              />
            </Field>
            <Field label="Last Name">
              <TextInput
                name="lastName"
                value={lastName}
                onChange={(value) => setLastName(toTitleCase(value))}
                placeholder="Last name"
                disabled={pending}
              />
            </Field>
            <Field label="Email" hint="Used to sign in. Contact support to change.">
              <TextInput
                value={email}
                onChange={() => {}}
                disabled
                leftIcon={<Mail size={16} className="text-slate-400" />}
              />
            </Field>
            <Field label="Sex">
              <SexSelect value={sex} onChange={setSex} disabled={pending} />
            </Field>
            <Field label="Mobile (WhatsApp)">
              <PhoneInput
                name="whatsapp"
                value={whatsapp}
                onChange={setWhatsapp}
                countries={countries}
                suggestedCountryIso={countryCode}
                syncToken={phoneSyncToken}
                disabled={pending}
              />
            </Field>
            <div className="flex flex-col gap-2">
              <Field label="Date of Birth" error={dateOfBirthError ?? undefined}>
                <TextInput
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={handleDateOfBirthChange}
                  type="date"
                  min={dateOfBirthBounds.min}
                  max={dateOfBirthBounds.max}
                  disabled={pending}
                  error={Boolean(dateOfBirthError)}
                  leftIcon={<Cake size={16} className="text-slate-400" />}
                />
              </Field>
              {showParentalConsent ? (
                <ParentalConsentBlock
                  checked={parentalConsent}
                  onChange={setParentalConsent}
                  disabled={pending}
                  error={isParentalConsentValidationError(dateOfBirthError)}
                />
              ) : null}
            </div>
            <Field label="Country">
              <CountryCombobox
                value={countryCode}
                onChange={handleCountryChange}
                countries={countries}
                disabled={pending}
              />
            </Field>
            <Field label="City" hint={loadingCities ? 'Loading suggestions…' : 'Start typing or pick a suggestion.'}>
              <CityCombobox
                value={city}
                onChange={setCity}
                suggestions={citySuggestions}
                onSuggestionSelect={handleCitySuggestion}
                disabled={pending}
                loading={loadingCities}
              />
            </Field>
            <Field label="Timezone">
              <TimezonePicker value={timezoneId} onChange={setTimezoneId} disabled={pending} />
            </Field>
            <Field label="Meal Preference">
              <MealPreferenceSelect value={mealPreference} onChange={setMealPreference} disabled={pending} />
            </Field>
          </div>

          {state.error ? <p className="mt-3 text-sm font-medium text-danger-press">{state.error}</p> : null}

          <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="ghost" size="md" onClick={resetForm} disabled={pending || !isDirty}>
              Discard
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={pending || !canSave} aria-busy={pending}>
              <span className="relative inline-flex items-center justify-center">
                <span className={pending ? 'opacity-0' : undefined}>Save Changes</span>
                {pending ? <Loader2 size={16} className="absolute animate-spin" aria-hidden /> : null}
              </span>
            </Button>
          </div>
        </form>
      </Card>
    </PortalPageLayout>
  );
}
