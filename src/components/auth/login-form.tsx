'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Eye, EyeOff, Flame, Lock, Mail, Trophy } from 'lucide-react';
import { useState } from 'react';
import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthShowcase } from '@/components/auth/auth-showcase';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth integration deferred
  };

  const handleGoogleClick = () => {
    // Auth integration deferred
  };

  const showcase = (
    <AuthShowcase
      eyebrow="Take Control · flagship program"
      headline={
        <>
          Welcome back. Your <span className="text-motivation">slow burn</span> is in motion.
        </>
      }
      bullets={[
        {
          icon: <Flame className="h-[18px] w-[18px] fill-white text-white" />,
          eyebrow: 'Next monthly cycle',
          text: 'Aug 28 · ₹3,540',
        },
        {
          icon: <Calendar className="h-[18px] w-[18px] text-white" />,
          eyebrow: 'Coach webinar',
          text: 'Sat 7 PM · The protein floor',
        },
        {
          icon: <Trophy className="h-[18px] w-[18px] text-white" />,
          eyebrow: 'Initiation phase',
          text: 'Day 64 of 90',
        },
      ]}
      footer={<span>v2.1 · slowburnmethod.in/portal</span>}
    />
  );

  return (
    <AuthLayout side={showcase}>
      <div className="mb-7">
        <SbmWordmark size="md" />
      </div>

      <Eyebrow className="mb-2.5">Welcome back</Eyebrow>
      <h1 className="text-[36px] leading-[1.05] font-extrabold tracking-tight text-slate-900">
        Sign in to your portal.
      </h1>
      <p className="mt-2.5 mb-7 max-w-[360px] text-sm font-medium text-slate-500">
        Manage your Take Control subscription, invoices, and account.
      </p>

      <GoogleSignInButton onClick={handleGoogleClick} />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field label="Email">
          <TextInput
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            type="email"
            leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
          />
        </Field>

        <Field
          label={
            <span className="flex w-full justify-between">
              <span>Password</span>
              <Link href="/forgot-password" className="text-xs font-semibold text-brand no-underline">
                Forgot?
              </Link>
            </span>
          }
        >
          <TextInput
            value={password}
            onChange={setPassword}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex cursor-pointer border-none bg-transparent p-0"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400" />
                )}
              </button>
            }
          />
        </Field>

        <Checkbox checked={rememberMe} onChange={setRememberMe} label="Keep me signed in on this device" />

        <div className="mt-1">
          <Button type="submit" variant="primary" size="lg" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
            Sign in
          </Button>
        </div>
      </form>

      <p className="mt-5.5 text-center text-[13px] font-medium text-slate-500">
        New to Slow Burn Method?{' '}
        <Link href="/signup" className="font-bold text-brand no-underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
