'use client';

import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth integration deferred
  };

  return (
    <AuthLayout>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field label="Email">
          <TextInput
            value={email}
            onChange={(value) => {
              setEmail(value);
              if (error) setError(null);
            }}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            tabIndex={1}
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            error={!!error}
          />
        </Field>

        <Field
          label={
            <span className="flex w-full justify-between">
              <span>Password</span>
              <Link href="/forgot-password" tabIndex={4} className="text-xs font-semibold text-brand no-underline">
                Forgot Password?
              </Link>
            </span>
          }
        >
          <TextInput
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (error) setError(null);
            }}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            tabIndex={2}
            leftIcon={<Lock className="h-4 w-4" />}
            error={!!error}
            rightIcon={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="flex cursor-pointer border-none bg-transparent p-0"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </Field>

        <div className="min-h-6 py-0.5" role={error ? 'alert' : undefined} aria-live="polite">
          {error && <p className="text-[12.5px] leading-snug font-semibold text-danger-press">{error}</p>}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          tabIndex={3}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-5.5 text-center text-[13px] font-medium text-slate-500">
        New to Slow Burn Method?{' '}
        <Link href="/signup" tabIndex={5} className="font-bold text-brand no-underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
