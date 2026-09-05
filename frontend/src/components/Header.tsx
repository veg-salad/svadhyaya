import { useAuth } from '../auth/AuthContext';

import { Dvaja } from './IndicIcons';
import ThemeToggle from './ThemeToggle';

/**
 * Top-of-page header. Signed-in state shows the user's full name and a
 * dvaja icon for sign-out; theme toggle sits between.
 */
export default function Header(): JSX.Element {
  const { tokens, signOut } = useAuth();
  return (
    <header className="relative z-10 border-b border-border-warm bg-parchment-50/80 backdrop-blur dark:border-border-deep dark:bg-surface-deep/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl leading-none">
            Svadhyāya
            <span className="danda" aria-hidden />
            <span className="text-lg font-medium text-ink-muted dark:text-ink-inverse-muted">
              Bodha Research Assistant
            </span>
          </h1>
          <p className="inscription mt-1">
            Dṛṣṭi-Śuddhi <span className="danda" aria-hidden /> Śodharthī
          </p>
        </div>

        <div className="flex items-center gap-3">
          {tokens && (
            <div className="hidden text-right sm:block">
              <p className="font-serif text-base leading-tight text-ink dark:text-ink-inverse">
                Namaste, {tokens.name || 'friend'}
              </p>
              <p className="text-xs text-ink-muted dark:text-ink-inverse-muted">
                {tokens.email}
              </p>
            </div>
          )}
          <ThemeToggle />
          {tokens && (
            <button
              type="button"
              className="btn-ghost"
              onClick={signOut}
              title="Sign out"
            >
              <Dvaja className="h-4 w-4" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
