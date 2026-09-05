import { Compass, Sparkles, ScrollText } from 'lucide-react';

import type { ScholarBrief } from '../types';

interface Props {
  brief: ScholarBrief;
}

/**
 * Renders the "Shodharthi" scholar brief: executive summary, core Indic
 * themes, and recommended research angles.
 */
export default function ScholarBriefPanel({ brief }: Props): JSX.Element {
  const empty =
    !brief.executiveSummary &&
    brief.coreIndicThemes.length === 0 &&
    brief.recommendedResearchAngles.length === 0;

  if (empty) {
    return (
      <div className="card p-6 text-center text-ink-muted">
        <ScrollText className="mx-auto mb-3 h-6 w-6 text-terracotta" aria-hidden />
        <p className="font-serif text-lg text-ink">No brief yet.</p>
        <p className="mt-1 text-sm">Analyze a passage to generate one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="card p-6">
        <header className="mb-3 flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-terracotta" aria-hidden />
          <h3 className="text-lg">Executive Summary</h3>
        </header>
        <p className="font-serif text-base leading-relaxed text-ink">
          {brief.executiveSummary || '—'}
        </p>
      </section>

      <section className="card p-6">
        <header className="mb-3 flex items-center gap-2">
          <Compass className="h-4 w-4 text-terracotta" aria-hidden />
          <h3 className="text-lg">Core Indic Themes</h3>
        </header>
        <ul className="space-y-2">
          {brief.coreIndicThemes.map((theme, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-terracotta" />
              <span>{theme}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6">
        <header className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-terracotta" aria-hidden />
          <h3 className="text-lg">Recommended Research Angles</h3>
        </header>
        <ol className="space-y-3">
          {brief.recommendedResearchAngles.map((angle, i) => (
            <li key={i} className="flex gap-3 text-sm text-ink">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-terracotta/10 text-xs font-semibold text-terracotta">
                {i + 1}
              </span>
              <span className="leading-relaxed">{angle}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
