import { useCallback, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { SAMPLE_TEXT } from '../sample';
import type { AnalyzeResponse, AnalyzeStage } from '../types';

import EmicAlignmentPanel from './EmicAlignmentPanel';
import ScholarBriefPanel from './ScholarBriefPanel';

type TabKey = 'emic' | 'brief';

/** Two-column workspace: Pāṭha (5/12) left, Vimarśa (7/12) right. */
export default function ResearchWorkspace(): JSX.Element {
  const { tokens } = useAuth();
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [tab, setTab] = useState<TabKey>('emic');
  const [stage, setStage] = useState<AnalyzeStage>('idle');
  const [error, setError] = useState<string | null>(null);

  const isLoading = stage === 'emic' || stage === 'brief';
  const canSubmit = text.trim().length >= 20 && !isLoading && !!tokens;

  const stageLabel = useMemo(() => {
    switch (stage) {
      case 'emic':
        return 'Scanning Dṛṣṭi-Śuddhi...';
      case 'brief':
        return 'Composing Śodharthī...';
      case 'done':
        return 'Analysis complete.';
      default:
        return '';
    }
  }, [stage]);

  const runAnalysis = useCallback(async () => {
    if (!tokens) return;
    setError(null);
    setResult(null);
    setStage('emic');

    const briefTimer = window.setTimeout(() => setStage('brief'), 900);

    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.idToken}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || `Request failed with ${res.status}`);
      }
      const payload = (await res.json()) as AnalyzeResponse;
      setResult(payload);
      setStage('done');
      setTab('emic');
    } catch (err) {
      setStage('idle');
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      window.clearTimeout(briefTimer);
    }
  }, [text, tokens]);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <section className="flex min-h-[70vh] flex-col lg:col-span-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="inscription">Pāṭha</p>
            <h2 className="flex items-center gap-2 text-xl">
              <Icon
                icon="game-icons:book-cover"
                className="h-5 w-5 text-terracotta"
              />
              Research Passage
            </h2>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setText(SAMPLE_TEXT)}
          >
            Load Sample Text
          </button>
        </div>

        <textarea
          className="textarea-scholar min-h-[50vh]"
          placeholder="Paste a draft passage or raw field notes here (minimum 20 characters)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={runAnalysis}
            disabled={!canSubmit}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Icon icon="game-icons:oil-lamp" className="h-4 w-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Ārambha · Analyze'}
          </button>

          {stageLabel && (
            <span className="flex items-center gap-2 text-sm text-ink-muted dark:text-ink-inverse-muted">
              {isLoading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              )}
              {stageLabel}
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-crimson/30 bg-crimson/5 p-3 text-sm text-crimson dark:text-crimson-light">
            {error}
          </div>
        )}
      </section>

      <section className="flex min-h-[70vh] flex-col lg:col-span-7">
        <div className="mb-3">
          <p className="inscription">Vimarśa</p>
          <h2 className="flex items-center gap-2 text-xl">
            <Icon
              icon="game-icons:mandala"
              className="h-5 w-5 text-terracotta"
            />
            Analysis
          </h2>
        </div>

        <div className="mb-4 flex gap-6 border-b border-border-warm text-sm font-medium dark:border-border-deep">
          <button
            type="button"
            className={`-mb-px border-b-2 px-1 py-2 transition-colors ${
              tab === 'emic' ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => setTab('emic')}
          >
            Dṛṣṭi-Śuddhi
            <span className="ml-1 text-xs text-ink-muted dark:text-ink-inverse-muted">
              (Emic Alignment)
            </span>
          </button>
          <button
            type="button"
            className={`-mb-px border-b-2 px-1 py-2 transition-colors ${
              tab === 'brief' ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => setTab('brief')}
          >
            Śodharthī
            <span className="ml-1 text-xs text-ink-muted dark:text-ink-inverse-muted">
              (Scholar Brief)
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {!result ? (
            <div className="card p-6 text-center text-ink-muted dark:text-ink-inverse-muted">
              <p className="font-serif text-lg text-ink dark:text-ink-inverse">
                Awaiting analysis.
              </p>
              <p className="mt-1 text-sm">
                Paste or load a passage on the left, then press{' '}
                <span className="font-medium text-ink dark:text-ink-inverse">
                  Ārambha
                </span>
                .
              </p>
            </div>
          ) : tab === 'emic' ? (
            <EmicAlignmentPanel alignments={result.emicAlignments} />
          ) : (
            <ScholarBriefPanel brief={result.scholarBrief} />
          )}
        </div>
      </section>
    </div>
  );
}
