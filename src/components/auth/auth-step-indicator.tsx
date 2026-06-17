import { Fragment } from 'react';
import { cn } from '@/lib/cn';

export type AuthStepDefinition = {
  step: number;
  label: string;
};

type AuthStepIndicatorProps = {
  steps: AuthStepDefinition[];
  currentStep: number;
  ariaLabel?: string;
};

export function AuthStepIndicator({ steps, currentStep, ariaLabel = 'Progress' }: AuthStepIndicatorProps) {
  return (
    <nav aria-label={ariaLabel} className="mb-6">
      <ol className="flex w-full items-start justify-between">
        {steps.map(({ step, label }, index) => {
          const isComplete = step < currentStep;
          const isCurrent = step === currentStep;
          const connectorComplete = step < currentStep;

          return (
            <Fragment key={step}>
              <li className="flex shrink-0 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isComplete && 'bg-brand text-white',
                    isCurrent && 'bg-brand-deep text-white',
                    !isComplete && !isCurrent && 'bg-slate-100 text-slate-400'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {step}
                </span>
                <span
                  className={cn(
                    'text-center text-[10px] leading-tight font-semibold tracking-wide whitespace-nowrap uppercase',
                    isCurrent ? 'text-brand-deep' : 'text-slate-400'
                  )}
                >
                  {label}
                </span>
              </li>
              {index < steps.length - 1 ? (
                <li aria-hidden className="flex min-w-3 flex-1 items-center self-start px-1 pt-3.5">
                  <div className={cn('h-px w-full', connectorComplete ? 'bg-brand/40' : 'bg-slate-100')} />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
