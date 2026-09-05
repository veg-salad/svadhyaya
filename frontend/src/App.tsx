import { AuthProvider, useAuth } from './auth/AuthContext';
import Header from './components/Header';
import ResearchWorkspace from './components/ResearchWorkspace';
import SignInGate from './components/SignInGate';
import { ThemeProvider } from './theme';

/** Renders the gated workspace once the auth session has hydrated. */
function AppBody(): JSX.Element {
  const { ready, tokens } = useAuth();

  return (
    <div className="min-h-full">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {!ready ? (
          <div className="py-24 text-center text-ink-muted dark:text-ink-inverse-muted">
            Loading svādhyāya...
          </div>
        ) : tokens ? (
          <ResearchWorkspace />
        ) : (
          <SignInGate />
        )}
      </main>

      <footer className="border-t border-border-warm bg-parchment-100 dark:border-border-deep dark:bg-surface-deep-alt">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-ink-muted dark:text-ink-inverse-muted">
          Bodha Research Think Tank <span className="danda" aria-hidden />
          Designed by ṛta &mdash; ethical, harmonious, regenerative.
        </div>
      </footer>
    </div>
  );
}

/**
 * Top-level app shell wired with theme + auth providers.
 */
export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppBody />
      </AuthProvider>
    </ThemeProvider>
  );
}
