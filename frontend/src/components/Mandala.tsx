interface Props {
  className?: string;
  /** Overall stroke opacity multiplier. Defaults to 1. */
  strength?: number;
  /** Optional label for screen readers; hidden by default. */
  label?: string;
}

/**
 * Purely geometric mandala: concentric rings of petals + a hexagram + bindu.
 * Uses `currentColor`, no fills except the central dot, no deity imagery.
 */
export default function Mandala({
  className,
  strength = 1,
  label,
}: Props): JSX.Element {
  const outerPetals = 24;
  const midPetals = 12;
  const innerPetals = 8;
  return (
    <svg
      viewBox="-100 -100 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      role={label ? 'img' : 'presentation'}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {/* outer ring */}
      <circle r="95" strokeWidth={0.6 * strength} opacity={0.9} />
      <circle r="88" strokeWidth={0.3 * strength} opacity={0.6} />

      {/* 24 outer petals */}
      {Array.from({ length: outerPetals }, (_, i) => (
        <path
          key={`o-${i}`}
          d="M0 -85 Q5 -70 0 -55 Q-5 -70 0 -85 Z"
          transform={`rotate(${(360 / outerPetals) * i})`}
          strokeWidth={0.5 * strength}
          opacity={0.85}
        />
      ))}

      {/* mid ring */}
      <circle r="55" strokeWidth={0.4 * strength} opacity={0.7} />

      {/* 12 mid petals */}
      {Array.from({ length: midPetals }, (_, i) => (
        <path
          key={`m-${i}`}
          d="M0 -50 Q4 -36 0 -26 Q-4 -36 0 -50 Z"
          transform={`rotate(${(360 / midPetals) * i + 15})`}
          strokeWidth={0.6 * strength}
          opacity={0.85}
        />
      ))}

      {/* inner ring */}
      <circle r="26" strokeWidth={0.5 * strength} opacity={0.75} />

      {/* 8 inner petals */}
      {Array.from({ length: innerPetals }, (_, i) => (
        <path
          key={`i-${i}`}
          d="M0 -22 Q3 -14 0 -8 Q-3 -14 0 -22 Z"
          transform={`rotate(${(360 / innerPetals) * i})`}
          strokeWidth={0.7 * strength}
          opacity={0.9}
        />
      ))}

      {/* Ṣaṭkoṇa (two overlapping triangles = 6-point star) */}
      <polygon
        points="0,-14 12.1,7 -12.1,7"
        strokeWidth={0.6 * strength}
        opacity={0.9}
      />
      <polygon
        points="0,14 12.1,-7 -12.1,-7"
        strokeWidth={0.6 * strength}
        opacity={0.9}
      />

      {/* central bindu */}
      <circle r="1.6" fill="currentColor" opacity={0.9} />
    </svg>
  );
}
