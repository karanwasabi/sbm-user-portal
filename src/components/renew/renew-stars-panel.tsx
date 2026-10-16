'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { formatInrFromPaise } from '@/lib/money';
import type { RenewStarsApplyResponse, RenewStarsBalance } from '@/types/renew';
import {
  getRenewStarsBalance,
  postRenewStarsApply,
  postRenewStarsCancel,
  postRenewStarsGrant,
  postRenewStarsRequestOtp,
} from '@/utils/client-api';
import { createClient } from '@/utils/supabase/client';

type RenewStarsPanelProps = {
  email: string;
  countryIso: string;
  planKey: string | null;
  /** Gross amount due before stars (plan total). Used to clamp the slider. */
  amountDuePaise: number | null;
  /** Keep this much of the due amount unpaid (renewal_1m mandate floor). */
  reserveMinPaise?: number;
  /** Autopay-blocked path: clamp against next_charge_total_paise from balance. */
  autopay?: boolean;
  onAppliedChange: (applied: RenewStarsApplyResponse | null) => void;
};

function maxStarsForDue(
  available: number,
  amountDuePaise: number | null,
  rate: number,
  reserveMinPaise: number
): number {
  if (!amountDuePaise || amountDuePaise <= 0 || rate <= 0) return available;
  const spendable = amountDuePaise - Math.max(0, reserveMinPaise);
  if (spendable <= 0) return 0;
  return Math.min(available, Math.floor(spendable / rate));
}

export function RenewStarsPanel({
  email,
  countryIso,
  planKey,
  amountDuePaise,
  reserveMinPaise = 0,
  autopay = false,
  onAppliedChange,
}: RenewStarsPanelProps) {
  const [balance, setBalance] = useState<RenewStarsBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starsToRedeem, setStarsToRedeem] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [grantToken, setGrantToken] = useState<string | null>(null);
  const [applied, setApplied] = useState<RenewStarsApplyResponse | null>(null);

  const rate = balance?.rate_paise_per_star ?? 200;
  const available = balance?.available_stars ?? 0;
  const dueForClamp =
    autopay && typeof balance?.next_charge_total_paise === 'number' ? balance.next_charge_total_paise : amountDuePaise;
  const sliderMax = maxStarsForDue(available, dueForClamp, rate, reserveMinPaise);
  const requiresPlan = !autopay;
  const applyDisabled = busy || starsToRedeem <= 0 || sliderMax <= 0 || (requiresPlan && !planKey);

  const loadBalance = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      setBalance(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getRenewStarsBalance(trimmed);
      setBalance(data);
      if (data.open_reservation) {
        const reserved: RenewStarsApplyResponse = {
          redemption_id: data.open_reservation.redemption_id,
          path: 'prepaid_checkout',
          status: 'reserved',
          stars_requested: data.open_reservation.stars_applied,
          stars_applied: data.open_reservation.stars_applied,
          discount_paise: data.open_reservation.discount_paise,
          clamped: false,
        };
        setApplied(reserved);
        onAppliedChange(reserved);
        setStarsToRedeem(data.open_reservation.stars_applied);
      } else if (data.pending_cashback) {
        const pending: RenewStarsApplyResponse = {
          redemption_id: data.pending_cashback.redemption_id,
          path: 'autopay_cashback',
          status: data.pending_cashback.status,
          stars_requested: data.pending_cashback.stars_applied,
          stars_applied: data.pending_cashback.stars_applied,
          discount_paise: data.pending_cashback.discount_paise,
          clamped: false,
        };
        setApplied(pending);
        onAppliedChange(pending);
        setStarsToRedeem(data.pending_cashback.stars_applied);
      } else {
        setApplied(null);
        onAppliedChange(null);
        setStarsToRedeem(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load stars');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [email, onAppliedChange]);

  useEffect(() => {
    void loadBalance();
  }, [loadBalance]);

  useEffect(() => {
    setStarsToRedeem((prev) => Math.min(prev, sliderMax));
  }, [sliderMax]);

  const discountPreviewPaise = useMemo(() => starsToRedeem * rate, [starsToRedeem, rate]);

  const ensureGrant = useCallback(async (): Promise<string> => {
    if (grantToken) return grantToken;
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    let accessToken = session?.access_token ?? null;
    const sessionEmail = session?.user?.email?.trim().toLowerCase() ?? '';
    const renewEmail = email.trim().toLowerCase();

    if (!accessToken || sessionEmail !== renewEmail) {
      if (!otpSent) {
        await postRenewStarsRequestOtp(renewEmail);
        setOtpSent(true);
        throw new Error('OTP_REQUIRED');
      }
      if (!/^\d{6,8}$/.test(otp.trim())) {
        throw new Error('Enter the OTP sent to your email');
      }
      const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({
        email: renewEmail,
        token: otp.trim(),
        type: 'email',
      });
      if (verifyError) {
        throw new Error(verifyError.message || 'Invalid OTP');
      }
      accessToken = verified.session?.access_token ?? null;
      if (!accessToken) {
        throw new Error('Could not verify email');
      }
    }

    const grant = await postRenewStarsGrant(renewEmail, accessToken);
    setGrantToken(grant.grant_token);
    return grant.grant_token;
  }, [email, grantToken, otp, otpSent]);

  const handleApply = async () => {
    if (starsToRedeem <= 0 || applyDisabled) return;
    setBusy(true);
    setError(null);
    try {
      const token = await ensureGrant();
      const result = await postRenewStarsApply({
        email: email.trim().toLowerCase(),
        grant_token: token,
        stars_requested: starsToRedeem,
        idempotency_key: crypto.randomUUID(),
        plan_key: planKey || undefined,
        country_iso: countryIso,
      });
      setApplied(result);
      onAppliedChange(result);
      setStarsToRedeem(result.stars_applied);
      setGrantToken(null);
      setOtpSent(false);
      setOtp('');
      await loadBalance();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not redeem stars';
      if (message === 'OTP_REQUIRED') {
        setError('We sent a code to your email. Enter it below to redeem stars.');
      } else {
        setGrantToken(null);
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!applied) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      let token = grantToken;
      if (!token && session?.access_token) {
        try {
          const grant = await postRenewStarsGrant(email.trim().toLowerCase(), session.access_token);
          token = grant.grant_token;
          setGrantToken(token);
        } catch {
          // fall through — cancel also accepts bearer
        }
      }
      await postRenewStarsCancel({
        email: email.trim().toLowerCase(),
        grant_token: token ?? undefined,
        redemption_id: applied.redemption_id,
        accessToken: session?.access_token,
      });
      setApplied(null);
      onAppliedChange(null);
      setGrantToken(null);
      await loadBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel redemption');
    } finally {
      setBusy(false);
    }
  };

  const handleResendOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      await postRenewStarsRequestOtp(email.trim().toLowerCase());
      setOtpSent(true);
      setOtp('');
      setError('We sent a new code to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setBusy(false);
    }
  };

  if (loading && !balance) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading rewards…
      </div>
    );
  }

  if (!balance?.enabled) {
    return null;
  }

  const showPendingCashback = Boolean(balance.pending_cashback) || applied?.path === 'autopay_cashback';
  const showPrepaidApplied = applied?.path === 'prepaid_checkout';
  const showRedeemControls = !showPendingCashback && !showPrepaidApplied;
  const cashbackStatus = applied?.status ?? balance.pending_cashback?.status ?? '';
  const canCancelCashback =
    applied?.path === 'autopay_cashback' &&
    (cashbackStatus === 'cashback_pending' || cashbackStatus === 'cashback_failed');

  return (
    <section className="rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-4 text-sm text-slate-800">
      <div className="flex items-start gap-2">
        <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-500" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">Redeem stars</p>
          <p className="mt-0.5 text-slate-600">
            You have <span className="font-semibold text-slate-900">{available}</span> stars
            {balance.earned_stars > available ? (
              <span className="text-slate-500"> ({balance.earned_stars} earned)</span>
            ) : null}
            . Each star is worth {formatInrFromPaise(rate)}.
          </p>

          {showPendingCashback ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="rounded-lg bg-white/70 px-3 py-2 text-slate-700">
                Pending cashback of{' '}
                {formatInrFromPaise(applied?.discount_paise ?? balance.pending_cashback?.discount_paise ?? 0)} (
                {applied?.stars_applied ?? balance.pending_cashback?.stars_applied ?? 0} stars) will apply on your next
                billing charge.
              </p>
              {canCancelCashback ? (
                <Button type="button" variant="light" size="sm" disabled={busy} onClick={() => void handleCancel()}>
                  Remove
                </Button>
              ) : cashbackStatus === 'cashback_processing' ? (
                <p className="text-xs font-medium text-slate-500">Cashback refund in progress…</p>
              ) : null}
            </div>
          ) : null}

          {showPrepaidApplied ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="font-medium text-slate-900">
                Applying {applied.stars_applied} stars (−{formatInrFromPaise(applied.discount_paise)})
              </p>
              <Button type="button" variant="light" size="sm" disabled={busy} onClick={() => void handleCancel()}>
                Remove
              </Button>
            </div>
          ) : null}

          {showRedeemControls ? (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase" htmlFor="stars-redeem">
                  Stars to redeem (max {sliderMax})
                </label>
                <input
                  id="stars-redeem"
                  type="range"
                  min={0}
                  max={Math.max(sliderMax, 0)}
                  value={Math.min(starsToRedeem, sliderMax)}
                  onChange={(e) => setStarsToRedeem(Number(e.target.value))}
                  className="mt-2 w-full accent-brand"
                  disabled={busy || sliderMax <= 0}
                />
                <p className="mt-1 text-slate-600">
                  {starsToRedeem} stars → {formatInrFromPaise(discountPreviewPaise)} off
                </p>
              </div>

              {otpSent ? (
                <div className="space-y-2">
                  <Field label="Email code">
                    <TextInput
                      value={otp}
                      onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="6-digit code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                  </Field>
                  <button
                    type="button"
                    className="text-xs font-semibold text-brand underline-offset-2 hover:underline"
                    disabled={busy}
                    onClick={() => void handleResendOtp()}
                  >
                    Resend code
                  </button>
                </div>
              ) : null}

              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={applyDisabled}
                onClick={() => void handleApply()}
                leftIcon={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                {otpSent ? 'Verify & redeem' : 'Redeem stars'}
              </Button>
            </div>
          ) : null}

          {error ? (
            <p className="mt-2 text-[12.5px] font-semibold text-danger-press" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
