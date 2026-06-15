'use client';

import {
  Cake,
  Calendar,
  Globe,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Receipt,
  Sparkles,
  UserRound,
  Utensils,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState, useTransition } from 'react';
import { loadCountryCities, updateProfile } from '@/app/(portal)/profile/actions';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { ProfilePageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { CityInput } from '@/components/profile/city-input';
import { TimezonePicker } from '@/components/profile/timezone-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Field } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { SelectInput } from '@/components/ui/select-input';
import { TextInput } from '@/components/ui/text-input';
import { formatTimezoneLabel } from '@/lib/profile-timezone';
import {
  getFullName,
  getInitials,
  MEAL_OPTIONS,
  SEX_OPTIONS,
  type MealPreference,
  type Sex,
  type UpdateProfileState,
} from '@/types/profile';
import type { Country, CountryCity } from '@/types/reference';

const initialState: UpdateProfileState = { error: null, success: false };

type ProfileViewProps = {
  countries: Country[];
};

export function ProfileView({ countries }: ProfileViewProps) {
  const router = useRouter();
  const { profile } = usePortalProfile();
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
  const [citySuggestions, setCitySuggestions] = useState<CountryCity[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const email = profile?.email ?? '';
  const fullName = profile ? getFullName(profile) : 'Member';
  const initials = profile ? getInitials(profile) : 'SB';

  const countryOptions = useMemo(() => countries.map((c) => ({ value: c.iso_code, label: c.name })), [countries]);

  const timezoneHighlight = timezoneId
    ? (formatTimezoneLabel(timezoneId).split(' (')[1]?.replace(')', '') ?? 'Set')
    : 'Not set';

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name ?? '');
    setLastName(profile.last_name ?? '');
    setDateOfBirth(profile.date_of_birth ?? '');
    setSex(profile.sex ?? '');
    setTimezoneId(profile.timezone_id ?? '');
    setCountryCode(profile.country_code ?? '');
    setCity(profile.city ?? '');
    setMealPreference(profile.meal_preference ?? '');
    setWhatsapp(profile.whatsapp ?? '');
  }, [profile]);

  useEffect(() => {
    if (!state.success) return;
    startTransition(() => router.refresh());
  }, [state.success, router, startTransition]);

  useEffect(() => {
    if (!countryCode) {
      setCitySuggestions([]);
      return;
    }

    let cancelled = false;
    setLoadingCities(true);
    loadCountryCities(countryCode)
      .then((rows) => {
        if (!cancelled) setCitySuggestions(rows);
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });

    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    const country = countries.find((c) => c.iso_code === code);
    if (country?.default_timezone_id) {
      setTimezoneId(country.default_timezone_id);
    }
  };

  const handleCitySuggestion = (entry: CountryCity) => {
    if (entry.timezone_id) {
      setTimezoneId(entry.timezone_id);
      return;
    }
    const country = countries.find((c) => c.iso_code === countryCode);
    if (country?.default_timezone_id) {
      setTimezoneId(country.default_timezone_id);
    }
  };

  const resetForm = () => {
    setFirstName(profile?.first_name ?? '');
    setLastName(profile?.last_name ?? '');
    setDateOfBirth(profile?.date_of_birth ?? '');
    setSex(profile?.sex ?? '');
    setTimezoneId(profile?.timezone_id ?? '');
    setCountryCode(profile?.country_code ?? '');
    setCity(profile?.city ?? '');
    setMealPreference(profile?.meal_preference ?? '');
    setWhatsapp(profile?.whatsapp ?? '');
  };

  const [notif, setNotif] = useState({
    coachWa: true,
    coachEmail: true,
    billing: true,
    webinars: true,
    marketing: false,
  });

  return (
    <PortalPageLayout
      eyebrow="Account"
      title={fullName}
      description="Keep your details up to date so your coach and billing stay in sync."
      illustration={<ProfilePageIllustration />}
      panelClassName="bg-gradient-to-br from-lilac via-[#B794F6] to-brand-deep"
      glowClassName="bg-white/35"
      highlights={[
        { label: 'Status', value: 'Active' },
        { label: 'Member since', value: 'Sep 2025' },
        { label: 'Timezone', value: timezoneHighlight },
      ]}
    >
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[18px]">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-brand-deep to-motivation text-[26px] font-extrabold tracking-wide text-white shadow-[0_10px_20px_-8px_rgba(92,101,207,0.40)]">
            {initials}
          </div>
          <div className="flex-1">
            <Eyebrow>Member since · Sep 13, 2025</Eyebrow>
            <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{fullName}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-xs font-medium text-slate-500">
              {email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400" />
                  {email}
                </span>
              )}
              <Pill tone="success">Active member</Pill>
            </div>
          </div>
          <Button variant="light" size="sm" className="shrink-0 self-start sm:self-center">
            Change photo
          </Button>
        </div>
      </Card>

      <Card>
        <SectionHead title="Personal details" subtitle="Used to personalise your program experience." />
        <form action={formAction}>
          <input type="hidden" name="timezoneId" value={timezoneId} />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="First name">
              <TextInput
                name="firstName"
                value={firstName}
                onChange={setFirstName}
                placeholder="First name"
                disabled={pending}
              />
            </Field>
            <Field label="Last name">
              <TextInput
                name="lastName"
                value={lastName}
                onChange={setLastName}
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
            <Field label="Date of birth">
              <TextInput
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={setDateOfBirth}
                type="date"
                disabled={pending}
                leftIcon={<Cake size={16} className="text-slate-400" />}
              />
            </Field>
            <Field label="Sex">
              <SelectInput
                value={sex}
                onChange={(v) => setSex(v as Sex)}
                options={SEX_OPTIONS}
                placeholder="Select sex"
                leftIcon={<UserRound size={16} />}
                disabled={pending}
              />
              <input type="hidden" name="sex" value={sex} />
            </Field>
            <Field label="Meal preference">
              <SelectInput
                value={mealPreference}
                onChange={(v) => setMealPreference(v as MealPreference)}
                options={MEAL_OPTIONS}
                placeholder="Select meal preference"
                leftIcon={<Utensils size={16} />}
                disabled={pending}
              />
              <input type="hidden" name="mealPreference" value={mealPreference} />
            </Field>
            <Field label="Country">
              <SelectInput
                value={countryCode}
                onChange={handleCountryChange}
                options={countryOptions}
                placeholder="Select country"
                leftIcon={<Globe size={16} />}
                disabled={pending}
              />
              <input type="hidden" name="countryCode" value={countryCode} />
            </Field>
            <Field label="City" hint={loadingCities ? 'Loading suggestions…' : 'Start typing or pick a suggestion.'}>
              <CityInput
                value={city}
                onChange={setCity}
                suggestions={citySuggestions}
                onSuggestionSelect={handleCitySuggestion}
                disabled={pending}
              />
              <input type="hidden" name="city" value={city} />
            </Field>
            <Field label="Timezone" className="sm:col-span-2">
              <TimezonePicker value={timezoneId} onChange={setTimezoneId} disabled={pending} />
            </Field>
            <Field label="Mobile (WhatsApp)" hint="Your coach uses this number." className="sm:col-span-2">
              <TextInput
                name="whatsapp"
                value={whatsapp}
                onChange={setWhatsapp}
                disabled={pending}
                leftIcon={<Phone size={16} className="text-slate-400" />}
              />
            </Field>
          </div>

          {state.error ? <p className="mt-3 text-sm font-medium text-danger-press">{state.error}</p> : null}
          {state.success ? <p className="mt-3 text-sm font-medium text-emerald-600">Profile saved.</p> : null}

          <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="ghost" size="md" onClick={resetForm} disabled={pending}>
              Discard
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <SectionHead title="Notification preferences" subtitle="Choose how we reach you." />
        <div className="flex flex-col gap-1">
          {[
            {
              key: 'coachWa' as const,
              title: 'Coach WhatsApp messages',
              sub: 'Daily check-ins and feedback from your coach',
              icon: MessageCircle,
            },
            {
              key: 'coachEmail' as const,
              title: 'Coach emails',
              sub: 'Long-form notes and weekly recaps',
              icon: Mail,
            },
            {
              key: 'billing' as const,
              title: 'Billing alerts',
              sub: 'Renewal reminders, failed payments, invoices',
              icon: Receipt,
            },
            {
              key: 'webinars' as const,
              title: 'Webinar invites',
              sub: 'Saturday live sessions and replays',
              icon: Calendar,
            },
            {
              key: 'marketing' as const,
              title: 'New program announcements',
              sub: 'Launches, batches, occasional offers',
              icon: Sparkles,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 border-t border-slate-100 py-3 first:border-t-0 first:pt-0"
            >
              <item.icon size={16} className="shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-500">{item.sub}</div>
              </div>
              <Checkbox
                checked={notif[item.key]}
                onChange={(checked) => setNotif((prev) => ({ ...prev, [item.key]: checked }))}
                label=""
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead title="Security" />
        <div className="flex flex-col gap-3 rounded-[14px] border border-slate-100 bg-canvas-cool p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Lock size={16} className="shrink-0 text-brand" />
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-800">Password</div>
              <div className="text-xs text-slate-500">Used to sign in to your account</div>
            </div>
          </div>
          <Button
            variant="light"
            size="sm"
            className="shrink-0 self-start sm:self-center"
            onClick={() => router.push('/profile/change-password')}
          >
            Change password
          </Button>
        </div>
      </Card>
    </PortalPageLayout>
  );
}
