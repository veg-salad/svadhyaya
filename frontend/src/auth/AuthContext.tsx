import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  currentTokens,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  type CognitoTokens,
} from './cognito';

interface AuthState {
  ready: boolean;
  tokens: CognitoTokens | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const Ctx = createContext<AuthState | null>(null);

/**
 * Boots the Cognito session from browser storage on mount and exposes
 * sign-in / sign-out actions.
 */
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [tokens, setTokens] = useState<CognitoTokens | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    currentTokens().then((t) => {
      if (!cancelled) {
        setTokens(t);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const t = await cognitoSignIn(email, password);
    setTokens(t);
  }, []);

  const signOut = useCallback(() => {
    cognitoSignOut();
    setTokens(null);
  }, []);

  const value = useMemo(
    () => ({ ready, tokens, signIn, signOut }),
    [ready, tokens, signIn, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Access the current auth state; throws if used outside `AuthProvider`. */
export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
