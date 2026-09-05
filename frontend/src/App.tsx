import ResearchWorkspace from './components/ResearchWorkspace';

/**
 * Top-level app shell: header + full-width workspace.
 */
export default function App(): JSX.Element {
  return (
    <div className="min-h-full">
      <header className="border-b border-border-warm bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl leading-none">
              Svadhyaya
              <span className="mx-2 text-ink-muted">|</span>
              <span className="text-lg font-medium text-ink-muted">
                Bodha Research Assistant
              </span>
            </h1>
            <p className="mt-1 text-xs uppercase tracking-widest text-ink-muted">
              Drishti-Shuddhi · Shodharthi
            </p>
          </div>
          <span className="badge-terracotta">MVP Demo</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <ResearchWorkspace />
      </main>

      <footer className="border-t border-border-warm bg-parchment-100">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-ink-muted">
          Bodha Research Think Tank · Emic scholarship, minimalist by design.
        </div>
      </footer>
    </div>
  );
}
