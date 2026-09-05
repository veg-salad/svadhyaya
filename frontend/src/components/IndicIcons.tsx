interface IconProps {
  className?: string;
}

const defaults = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Diya — oil lamp with a flame. Used for the "Ārambha" (begin) action. */
export function Diya({ className }: IconProps): JSX.Element {
  return (
    <svg {...defaults} className={className} aria-hidden="true">
      <path d="M12 3.2c1.4 1.5 2.1 2.9 2.1 4.5a2.1 2.1 0 0 1-4.2 0c0-1.6.7-3 2.1-4.5z" />
      <path d="M3.5 13c2.5 3.2 5.4 4.3 8.5 4.3s6-1.1 8.5-4.3z" />
      <path d="M4 13h16" />
      <path d="M12 17.3v3.5" />
    </svg>
  );
}

/** Grantha — palm-leaf manuscript stack. Used for the input passage. */
export function Grantha({ className }: IconProps): JSX.Element {
  return (
    <svg {...defaults} className={className} aria-hidden="true">
      <path d="M3 6.5h18" />
      <path d="M3 12h18" />
      <path d="M3 17.5h18" />
      <circle cx="12" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M2 6.5c0-1 .7-1.5 1.5-1.5M22 6.5c0-1-.7-1.5-1.5-1.5" />
      <path d="M2 17.5c0 1 .7 1.5 1.5 1.5M22 17.5c0 1-.7 1.5-1.5 1.5" />
    </svg>
  );
}

/** Yantra — mandala-inspired glyph. Used for the analysis panel. */
export function Yantra({ className }: IconProps): JSX.Element {
  return (
    <svg {...defaults} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polygon points="12,4 20.5,17 3.5,17" />
      <polygon points="12,20 3.5,7 20.5,7" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Chakra — 8-spoke wheel (Aśoka-style). Used for the theme toggle. */
export function Chakra({ className }: IconProps): JSX.Element {
  return (
    <svg {...defaults} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
      <line x1="5.6" y1="18.4" x2="18.4" y2="5.6" />
    </svg>
  );
}

/** Sūrya — sun with rays and central bindu. Used for the light-mode toggle. */
export function Surya({ className }: IconProps): JSX.Element {
  return (
    <svg {...defaults} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <line x1="12" y1="1.5" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22.5" />
      <line x1="1.5" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22.5" y2="12" />
      <line x1="4.5" y1="4.5" x2="6.4" y2="6.4" />
      <line x1="17.6" y1="17.6" x2="19.5" y2="19.5" />
      <line x1="4.5" y1="19.5" x2="6.4" y2="17.6" />
      <line x1="17.6" y1="6.4" x2="19.5" y2="4.5" />
    </svg>
  );
}

/** Chandra — waxing crescent moon. Used for the dark-mode toggle. */
export function Chandra({ className }: IconProps): JSX.Element {
  return (
    <svg {...defaults} className={className} aria-hidden="true">
      <path d="M20 14.5A8.2 8.2 0 1 1 11.5 4a6.4 6.4 0 0 0 8.5 10.5z" />
    </svg>
  );
}

/** Dvaja — banner flag on a staff. Used for the sign-out action. */
export function Dvaja({ className }: IconProps): JSX.Element {
  return (
    <svg {...defaults} className={className} aria-hidden="true">
      <line x1="5" y1="3" x2="5" y2="21" />
      <path d="M5 5 L19 8.5 L5 12 Z" />
    </svg>
  );
}

/** Kalasha — auspicious pot with a bindu on top. Ornamental accent. */
export function Kalasha({ className }: IconProps): JSX.Element {
  return (
    <svg {...defaults} className={className} aria-hidden="true">
      <path d="M6.5 9.5 Q6.5 4.5 12 4.5 Q17.5 4.5 17.5 9.5 L17.5 17 Q17.5 20.5 12 20.5 Q6.5 20.5 6.5 17 Z" />
      <path d="M7.5 8.5 H16.5" />
      <circle cx="12" cy="3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Torana — decorative arch used above cards. */
export function Torana({ className }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 200 30"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 28 Q100 -18 196 28" />
      <path d="M14 28 Q100 -6 186 28" opacity={0.55} />
      {/* small pendant drops */}
      <line x1="40" y1="18" x2="40" y2="23" />
      <line x1="70" y1="12" x2="70" y2="17" />
      <line x1="100" y1="6" x2="100" y2="11" />
      <line x1="130" y1="12" x2="130" y2="17" />
      <line x1="160" y1="18" x2="160" y2="23" />
      <circle cx="40" cy="24" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="70" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="100" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="130" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="160" cy="24" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
