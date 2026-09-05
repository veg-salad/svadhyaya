import { ArrowRight, BookOpen } from 'lucide-react';

import type { EmicAlignment } from '../types';

interface Props {
  alignments: EmicAlignment[];
}

/**
 * Renders the list of colonized/orientalist terms flagged by the model with
 * their suggested emic replacements and per-term rationale.
 */
export default function EmicAlignmentPanel({ alignments }: Props): JSX.Element {
  if (alignments.length === 0) {
    return (
      <div className="card p-6 text-center text-ink-muted">
        <BookOpen className="mx-auto mb-3 h-6 w-6 text-terracotta" aria-hidden />
        <p className="font-serif text-lg text-ink">
          No colonized framing detected.
        </p>
        <p className="mt-1 text-sm">
          The passage already reads in an emic register.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {alignments.map((a, idx) => (
        <li key={`${a.originalTerm}-${idx}`} className="card p-5">
          <div className="flex flex-wrap items-center gap-2 text-base">
            <span className="rounded-md bg-crimson/10 px-2 py-1 font-serif italic text-crimson">
              {a.originalTerm || '—'}
            </span>
            <ArrowRight className="h-4 w-4 text-ink-muted" aria-hidden />
            <span className="rounded-md bg-terracotta/10 px-2 py-1 font-serif font-semibold text-terracotta">
              {a.suggestedTerm || '—'}
            </span>
          </div>

          {a.context && (
            <blockquote className="mt-3 border-l-2 border-border-warm pl-3 font-serif text-sm italic text-ink-muted">
              &ldquo;{a.context}&rdquo;
            </blockquote>
          )}

          <p className="mt-3 text-sm leading-relaxed text-ink">
            {a.explanation}
          </p>
        </li>
      ))}
    </ul>
  );
}
