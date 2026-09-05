import { AuthProvider, useAuth } from './auth/AuthContext';
import Header from './components/Header';
import ResearchWorkspace from './components/ResearchWorkspace';
import SignInGate from './components/SignInGate';
import { ThemeProvider } from './theme';

/** Body chooses layout based on auth state; ambient mandala on all screens. */
function AppBody(): JSX.Element {
  const { ready, tokens } = useAuth();

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Ambient mehndi-style mandala backdrop, present on every screen. */}
      <img
        src="/images/mandala.jpg"
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 -z-0 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 select-none rounded-full opacity-[0.10] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-lighten"
      />

      <Header />

      <main
        className={
          tokens
            ? 'relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-8'
            : 'relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-4'
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
          Designed by ṛta &mdash; ethical, harmonious, regenerative.{' '}
          <span className="danda" aria-hidden />
          Ornament:{' '}
          <a
            className="underline hover:text-terracotta"
            href="https://www.magnific.com/free-vector/vector-ornamental-round-lace-with-damask-arabesque-elements-mehndi-style-orient-traditional-ornament-zentangle-like-round-colored-floral-ornament_1283448.htm"
            target="_blank"
            rel="noreferrer"
          >
            Freepik/Magnific
          </a>
          . Icons:{' '}
          <a
            className="underline hover:text-terracotta"
            href="https://game-icons.net/"
            target="_blank"
            rel="noreferrer"
          >
            game-icons.net
          </a>{' '}
          (CC BY 3.0).
        </div>
      </footer>
    </div>
  );
}

/** Root app shell. */
export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppBody />
      </AuthProvider>
    </ThemeProvider>
  );
}
