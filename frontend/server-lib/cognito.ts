import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let cachedIssuer: string | null = null;
let cachedClientId: string | null = null;

interface Config {
  region: string;
  poolId: string;
  clientId: string;
}

function readConfig(): Config {
  const region =
    process.env.COGNITO_REGION || process.env.AWS_REGION || 'ap-south-1';
  const poolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;
  if (!poolId || !clientId) {
    throw new Error(
      'COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set in the Vercel project env.',
    );
  }
  return { region, poolId, clientId };
}

export class UnauthorizedError extends Error {
  status = 401 as const;
}

/**
 * Verifies a Bearer token issued by our Cognito pool and returns its claims.
 * Throws `UnauthorizedError` for missing / malformed / bad-audience tokens.
 */
export async function verifyCognitoBearer(
  authHeader: string | string[] | undefined,
): Promise<JWTPayload & { email?: string; name?: string }> {
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing bearer token.');
  }
  const token = header.slice('Bearer '.length).trim();

  const { region, poolId, clientId } = readConfig();
  const issuer = `https://cognito-idp.${region}.amazonaws.com/${poolId}`;
  if (!cachedJwks || cachedIssuer !== issuer || cachedClientId !== clientId) {
    cachedJwks = createRemoteJWKSet(
      new URL(`${issuer}/.well-known/jwks.json`),
    );
    cachedIssuer = issuer;
    cachedClientId = clientId;
  }

  try {
    const { payload } = await jwtVerify(token, cachedJwks, { issuer });
    const tokenUse = payload['token_use'];
    if (tokenUse === 'id') {
      if (payload.aud !== clientId) throw new Error('wrong audience');
    } else if (tokenUse === 'access') {
      if (payload['client_id'] !== clientId) throw new Error('wrong client_id');
    } else {
      throw new Error('unexpected token_use');
    }
    return payload as JWTPayload & { email?: string; name?: string };
  } catch {
    throw new UnauthorizedError('Invalid or expired token.');
  }
}
