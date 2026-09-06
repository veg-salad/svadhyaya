import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRemoteJWKSet } from 'jose';

/** Diagnostic: does the `jose` package load and build a JWKS resolver. */
export default function handler(
  _req: VercelRequest,
  res: VercelResponse,
): void {
  try {
    const region = process.env.COGNITO_REGION || 'ap-south-1';
    const poolId = process.env.COGNITO_USER_POOL_ID || '';
    const issuer = `https://cognito-idp.${region}.amazonaws.com/${poolId}`;
    const jwks = createRemoteJWKSet(
      new URL(`${issuer}/.well-known/jwks.json`),
    );
    res.status(200).json({ ok: true, hasJwks: !!jwks });
  } catch (e) {
    res.status(500).json({
      ok: false,
      err: e instanceof Error ? e.message : String(e),
    });
  }
}
