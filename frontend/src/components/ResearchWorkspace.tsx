import { useCallback, useMemo, useState } from 'react';
import { FileText, Loader2, Play, Sparkles } from 'lucide-react';

import type { AnalyzeResponse, AnalyzeStage } from '../types';
import { SAMPLE_TEXT } from '../sample';

import EmicAlignmentPanel from './EmicAlignmentPanel';
import ScholarBriefPanel from './ScholarBriefPanel';

type TabKey = 'emic' | 'brief';

/**
 * Two-column research workspace: text input on the left, tabbed results on
 * the right (Emic Alignment + Scholar Brief).
 */
export default function ResearchWorkspace(): JSX.Element {
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [tab, setTab] = useState<TabKey>('emic');
  const [stage, setStage] = useState<AnalyzeStage>('idle');
  const [error, setError] = useState<string | null>(null);

  const isLoading = stage === 'emic' || stage === 'brief';
  const canSubmit = text.trim().length >= 20 && !isLoading;

  const stageLabel = useMemo(() => {
    switch (stage) {
      case 'emic':
        return 'Scanning Emic Alignment...';
      case 'brief':
        return 'Generating Scholar Brief...';
      case 'done':
        return 'Analysis complete.';
      default:
        return '';
    }
  }, [stage]);

  const runAnalysis = useCallback(async () => {
    setError(null);
    setResult(null);
    setStage('emic');

    const briefTimer = window.setTimeout(() => setStage('brief'), 900);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  }, [text]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left column: input */}
      <section className="flex min-h-[70vh] flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-terracotta" aria-hidden />
            Research Passage
          </h2>
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
              <Play className="h-4 w-4" aria-hidden />
            )}
            {isLoading ? 'Analyzing...' : 'Analyze Text'}
          </button>

          {stageLabel && (
            <span className="flex items-center gap-2 text-sm text-ink-muted">
              {isLoading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              )}
              {stageLabel}
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-crimson/30 bg-crimson/5 p-3 text-sm text-crimson">
            {error}
          </div>
        )}
      </section>

      {/* Right column: output */}
      <section className="flex min-h-[70vh] flex-col">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-terracotta" aria-hidden />
          <h2 className="text-xl">Analysis</h2>
        </div>

        <div className="mb-4 flex gap-6 border-b border-border-warm text-sm font-medium">
          <button
            type="button"
            className={`-mb-px border-b-2 px-1 py-2 transition-colors ${
              tab === 'emic' ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => setTab('emic')}
          >
            Emic Alignment
            <span className="ml-1 text-xs text-ink-muted">
              (Drishti-Shuddhi)
            </span>
          </button>
          <button
            type="button"
            className={`-mb-px border-b-2 px-1 py-2 transition-colors ${
              tab === 'brief' ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => setTab('brief')}
          >
            Scholar Brief
            <span className="ml-1 text-xs text-ink-muted">(Shodharthi)</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {!result ? (
            <div className="card p-6 text-center text-ink-muted">
              <p className="font-serif text-lg text-ink">
                Awaiting analysis.
              </p>
              <p className="mt-1 text-sm">
                Paste or load a passage on the left, then press{' '}
                <span className="font-medium text-ink">Analyze Text</span>.
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
