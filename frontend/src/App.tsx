import { AuthProvider, useAuth } from './auth/AuthContext';
import Header from './components/Header';
import Mandala from './components/Mandala';
import ResearchWorkspace from './components/ResearchWorkspace';
import SignInGate from './components/SignInGate';
import { ThemeProvider } from './theme';

/**
 * Body chooses layout based on auth state. On the sign-in screen the app
 * fits the viewport with no scroll; on the workspace screen it scrolls
 * naturally with the analysis output.
 */
function AppBody(): JSX.Element {
  const { ready, tokens } = useAuth();
  const signedIn = ready && !!tokens;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Ambient mandala watermarks — page-level. */}
      <Mandala
        className="pointer-events-none fixed -left-24 -top-24 h-[420px] w-[420px] text-terracotta/[0.05] dark:text-terracotta/[0.07]"
        strength={0.7}
      />
      <Mandala
        className="pointer-events-none fixed -bottom-32 -right-24 h-[520px] w-[520px] text-crimson/[0.05] dark:text-crimson-light/[0.06]"
        strength={0.7}
      />

      <Header />

      <main
        className={
          signedIn
            ? 'relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-8'
            : 'relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-6'
        }
      >
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

      <footer className="relative z-10 border-t border-border-warm bg-parchment-100/70 dark:border-border-deep dark:bg-surface-deep-alt/70">
        <div className="mx-auto max-w-6xl px-6 py-3 text-xs text-ink-muted dark:text-ink-inverse-muted">
          Bodha Research Think Tank <span className="danda" aria-hidden />
          Designed by ṛta &mdash; ethical, harmonious, regenerative.
        </div>
      </footer>
    </div>
  );
}

/** Root app shell with theme and auth providers. */
export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppBody />
      </AuthProvider>
    </ThemeProvider>
  );
}
