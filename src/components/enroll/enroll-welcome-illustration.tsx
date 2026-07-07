type EnrollWelcomeIllustrationProps = {
  className?: string;
};

/** Celebration + calendar motif for post-enrollment welcome. */
export function EnrollWelcomeIllustration({ className }: EnrollWelcomeIllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      className={className ?? 'h-auto w-full max-w-[300px]'}
      role="img"
      aria-label="Enrollment confirmed"
    >
      <circle cx="160" cy="100" r="72" fill="#5C65CF" fillOpacity="0.1" />
      <circle cx="160" cy="100" r="56" fill="white" fillOpacity="0.55" />

      <rect x="88" y="44" width="144" height="112" rx="20" fill="white" fillOpacity="0.98" />
      <rect x="88" y="44" width="144" height="32" rx="20" fill="#5C65CF" fillOpacity="0.92" />
      <rect x="88" y="64" width="144" height="12" fill="#5C65CF" fillOpacity="0.92" />
      <circle cx="112" cy="60" r="4" fill="white" fillOpacity="0.85" />
      <circle cx="128" cy="60" r="4" fill="white" fillOpacity="0.85" />
      <circle cx="144" cy="60" r="4" fill="white" fillOpacity="0.85" />
      <rect x="108" y="88" width="48" height="8" rx="4" fill="#C8CCFF" />
      <rect x="108" y="108" width="72" height="6" rx="3" fill="#E2E8F0" />
      <rect x="108" y="122" width="56" height="6" rx="3" fill="#E2E8F0" />
      <rect x="108" y="136" width="40" height="6" rx="3" fill="#E2E8F0" />

      <circle cx="196" cy="118" r="28" fill="#10B981" fillOpacity="0.95" />
      <path d="M184 118l8 8 16-16" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      <circle cx="248" cy="56" r="22" fill="#FFB703" fillOpacity="0.95" />
      <circle cx="248" cy="56" r="14" fill="#FF9F1C" fillOpacity="0.45" />
      <path
        d="M248 48c0 4.5-2 8-4 10.5-1.2 1.3-2.5 2-3.5 2.5 1 .5 2.3 1.2 3.5 2.5 2 2.5 4 6 4 10.5 0-4.5 2-8 4-10.5 1.2-1.3 2.5-2 3.5-2.5-1-.5-2.3-1.2-3.5-2.5-2-2.5-4-6-4-10.5z"
        fill="white"
        fillOpacity="0.95"
      />

      <circle cx="56" cy="72" r="16" fill="#C8B6FF" fillOpacity="0.9" />
      <path d="M50 72l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      <circle cx="72" cy="148" r="5" fill="#5C65CF" fillOpacity="0.35" />
      <circle cx="252" cy="148" r="4" fill="#FFB703" fillOpacity="0.55" />
      <circle cx="48" cy="120" r="3" fill="white" fillOpacity="0.5" />
      <circle cx="276" cy="108" r="3" fill="white" fillOpacity="0.4" />
    </svg>
  );
}
