import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Sanity endpoint that reports which env vars the function can see. */
export default function handler(
  req: VercelRequest,
  res: VercelResponse,
): void {
  res.status(200).json({
    ok: true,
    method: req.method,
    node: process.version,
    env: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL || null,
      COGNITO_REGION: process.env.COGNITO_REGION || null,
      COGNITO_USER_POOL_ID: !!process.env.COGNITO_USER_POOL_ID,
      COGNITO_CLIENT_ID: !!process.env.COGNITO_CLIENT_ID,
    },
  });
}
