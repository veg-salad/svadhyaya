import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { confirmSignUp, resendCode, signUp } from '../auth/cognito';

type Mode = 'signin' | 'signup' | 'confirm';

/**
 * Sign-in / sign-up / verification screen. Wraps the Cognito email-password
 * flow so unauthenticated users see nothing but this gate.
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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <div className="card p-8">
        <p className="inscription">{heading}</p>
        <h2 className="mt-1 text-3xl">{subheading}</h2>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
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
            <p className="rounded-md border border-crimson/30 bg-crimson/5 p-3 text-sm text-crimson dark:text-crimson-light">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-md border border-terracotta/30 bg-terracotta/5 p-3 text-sm text-terracotta">
              {info}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {mode === 'signin'
              ? 'Sign in'
              : mode === 'signup'
                ? 'Create account'
                : 'Verify and enter'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm text-ink-muted dark:text-ink-inverse-muted">
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
