import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUserSession,
  ISignUpResult,
} from 'amazon-cognito-identity-js';

const region = import.meta.env.VITE_COGNITO_REGION as string | undefined;
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined;

if (!region || !userPoolId || !clientId) {
  throw new Error(
    'Cognito env vars missing: set VITE_COGNITO_REGION, VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID.',
  );
}

export const cognitoRegion = region;
export const cognitoPoolId = userPoolId;
export const cognitoClientId = clientId;

export const userPool = new CognitoUserPool({
  UserPoolId: userPoolId,
  ClientId: clientId,
});

export interface CognitoTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  name: string;
  email: string;
}

/** Extracts a display-friendly session bundle from a Cognito session. */
export function tokensFromSession(session: CognitoUserSession): CognitoTokens {
  const idPayload = session.getIdToken().decodePayload() as Record<string, unknown>;
  return {
    idToken: session.getIdToken().getJwtToken(),
    accessToken: session.getAccessToken().getJwtToken(),
    refreshToken: session.getRefreshToken().getToken(),
    name: String(idPayload.name ?? ''),
    email: String(idPayload.email ?? ''),
  };
}

/** Sign up a new user with email + password + full name. */
export function signUp(
  email: string,
  password: string,
  name: string,
): Promise<ISignUpResult> {
  return new Promise((resolve, reject) => {
    const attrs = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
    ];
    userPool.signUp(email, password, attrs, [], (err, result) => {
      if (err || !result) return reject(err ?? new Error('signup failed'));
      resolve(result);
    });
  });
}

/** Confirm sign-up with the emailed verification code. */
export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    new CognitoUser({ Username: email, Pool: userPool }).confirmRegistration(
      code,
      true,
      (err) => (err ? reject(err) : resolve()),
    );
  });
}

/** Resend the verification code. */
export function resendCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    new CognitoUser({ Username: email, Pool: userPool }).resendConfirmationCode(
      (err) => (err ? reject(err) : resolve()),
    );
  });
}

/** Sign in with SRP flow, returns Cognito tokens. */
export function signIn(email: string, password: string): Promise<CognitoTokens> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const auth = new AuthenticationDetails({ Username: email, Password: password });
    user.authenticateUser(auth, {
      onSuccess: (session) => resolve(tokensFromSession(session)),
      onFailure: (err) => reject(err),
    });
  });
}

/** Fetch a fresh session for the currently signed-in user (if any). */
export function currentTokens(): Promise<CognitoTokens | null> {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser();
    if (!user) return resolve(null);
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) return resolve(null);
      resolve(tokensFromSession(session));
    });
  });
}

/** Sign the current user out of this browser. */
export function signOut(): void {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
}
