import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { confirmSignUp, resendCode, signUp } from '../auth/cognito';

import { Diya, Kalasha, Torana } from './IndicIcons';
import Mandala from './Mandala';

type Mode = 'signin' | 'signup' | 'confirm';

/**
 * Two-column sign-in gate. Left column: mandala illustration + animated
 * tagline. Right column: torana-crowned sign-in card. Fits the viewport
 * without producing a scrollbar on typical desktop heights.
 */
export default function SignInGate(): JSX.Element {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, name);
        setMode('confirm');
        setInfo('Check your email for a 6-digit verification code.');
      } else {
        await confirmSignUp(email, code);
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function onResend(): Promise<void> {
    setError(null);
    setInfo(null);
    try {
      await resendCode(email);
      setInfo('A new code has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code.');
    }
  }

  const heading =
    mode === 'signin'
      ? 'Praveśa'
      : mode === 'signup'
        ? 'Nava-praveśa'
        : 'Sākṣya';
  const subheading =
    mode === 'signin'
      ? 'Sign in to continue your svādhyāya.'
      : mode === 'signup'
        ? 'Create an account grounded in ṛta.'
        : 'Verify your email to complete registration.';

  return (
    <div className="grid w-full grid-cols-1 items-center gap-6 sm:grid-cols-12 sm:gap-8 md:gap-10">
      {/* Left: mandala + animated tagline */}
      <div className="relative order-2 sm:order-1 sm:col-span-7">
        <div className="relative mx-auto flex aspect-square w-full max-w-[380px] items-center justify-center md:max-w-[440px]">
          <Mandala className="absolute inset-0 h-full w-full text-terracotta/40 dark:text-terracotta/50 animate-spin-slow" />
          <Mandala className="absolute inset-6 h-[calc(100%-3rem)] w-[calc(100%-3rem)] text-crimson/25 dark:text-crimson-light/25 animate-spin-slower" />
          <div className="relative z-10 max-w-[220px] px-4 text-center sm:max-w-[240px]">
            <p className="inscription animate-rise">Svādhyāya</p>
            <p className="mt-3 font-serif text-base leading-snug text-ink animate-rise-delay dark:text-ink-inverse md:text-lg">
              A scholar&rsquo;s assistant that reads your draft in an{' '}
              <span className="animate-glow font-semibold">emic register</span>,
              flags colonized framings, and returns a research brief.
            </p>
          </div>
        </div>
      </div>

      {/* Right: sign-in card under a torana arch */}
      <div className="order-1 sm:order-2 sm:col-span-5">
        <Torana className="mx-auto mb-2 h-7 w-full max-w-sm text-terracotta/70" />
        <div className="relative mx-auto max-w-sm overflow-hidden card p-6">
          <Mandala
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 text-terracotta/10 dark:text-terracotta/15"
            strength={0.6}
          />

          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <Kalasha className="h-4 w-4 text-terracotta" />
              <p className="inscription">{heading}</p>
            </div>
            <h2 className="text-2xl leading-tight md:text-3xl">{subheading}</h2>

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              {mode === 'signup' && (
                <label className="block">
                  <span className="inscription">Full name</span>
                  <input
                    className="field mt-1"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </label>
              )}

              <label className="block">
                <span className="inscription">Email</span>
                <input
                  className="field mt-1"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              {mode !== 'confirm' && (
                <label className="block">
                  <span className="inscription">Password</span>
                  <input
                    className="field mt-1"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={10}
                    autoComplete={
                      mode === 'signin' ? 'current-password' : 'new-password'
                    }
                  />
                  {mode === 'signup' && (
                    <span className="mt-1 block text-xs text-ink-muted dark:text-ink-inverse-muted">
                      At least 10 characters with upper, lower, and a digit.
                    </span>
                  )}
                </label>
              )}

              {mode === 'confirm' && (
                <label className="block">
                  <span className="inscription">Verification code</span>
                  <input
                    className="field mt-1 tracking-widest"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </label>
              )}

              {error && (
                <p className="rounded-md border border-crimson/30 bg-crimson/5 p-2.5 text-sm text-crimson dark:text-crimson-light">
                  {error}
                </p>
              )}
              {info && (
                <p className="rounded-md border border-terracotta/30 bg-terracotta/5 p-2.5 text-sm text-terracotta">
                  {info}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Diya className="h-4 w-4" />
                )}
                {mode === 'signin'
                  ? 'Praveśa · Sign in'
                  : mode === 'signup'
                    ? 'Ārambha · Create account'
                    : 'Sākṣya · Verify and enter'}
              </button>
            </form>

            <div className="mt-4 flex flex-col gap-1.5 text-sm text-ink-muted dark:text-ink-inverse-muted">
              {mode === 'signin' && (
                <button
                  type="button"
                  className="text-left hover:text-terracotta"
                  onClick={() => setMode('signup')}
                >
                  New here? Create an account.
                </button>
              )}
              {mode === 'signup' && (
                <button
                  type="button"
                  className="text-left hover:text-terracotta"
                  onClick={() => setMode('signin')}
                >
                  Already registered? Sign in instead.
                </button>
              )}
              {mode === 'confirm' && (
                <>
                  <button
                    type="button"
                    className="text-left hover:text-terracotta"
                    onClick={onResend}
                  >
                    Resend verification code
                  </button>
                  <button
                    type="button"
                    className="text-left hover:text-terracotta"
                    onClick={() => setMode('signin')}
                  >
                    Back to sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
