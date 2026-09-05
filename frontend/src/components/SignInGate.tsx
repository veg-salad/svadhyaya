import { useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { confirmSignUp, resendCode, signUp } from '../auth/cognito';

type Mode = 'signin' | 'signup' | 'confirm';

/**
 * Centered sign-in gate with a traditional mandala image (Wikimedia
 * Commons, CC BY-SA 4.0) behind the card and a compact form on top.
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
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center py-4">
      {/* Traditional mandala backdrop, sits behind the card */}
      <img
        src="/images/mandala.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.08] dark:opacity-[0.14] dark:invert"
      />

      <p className="inscription relative mb-2 animate-rise">Svādhyāya</p>
      <p className="relative mb-6 max-w-sm px-4 text-center font-serif text-base leading-snug text-ink animate-rise-delay dark:text-ink-inverse md:text-lg">
        A scholar&rsquo;s assistant that reads your draft in an{' '}
        <span className="animate-glow font-semibold">emic register</span>, flags
        colonized framings, and returns a research brief.
      </p>

      <div className="relative w-full card p-7">
        <div className="mb-3 flex items-center gap-2">
          <Icon
            icon="game-icons:persian-vase"
            className="h-4 w-4 text-terracotta"
          />
          <p className="inscription">{heading}</p>
        </div>
        <h2 className="text-2xl leading-tight md:text-3xl">{subheading}</h2>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
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

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Icon icon="game-icons:oil-lamp" className="h-4 w-4" />
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
  );
}
