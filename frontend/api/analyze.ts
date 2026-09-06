import type { VercelRequest, VercelResponse } from '@vercel/node';

import { analyze } from '../server-lib/analyze';
import { UnauthorizedError, verifyCognitoBearer } from '../server-lib/cognito';

// Vercel Fluid Compute: give Terra enough headroom (Pro allows up to 300s).
export const config = {
  maxDuration: 60,
};

/** POST /api/analyze — runs the emic-alignment + scholar-brief analysis. */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method === 'OPTIONS') {
    // Vercel serves same-origin, so CORS is only needed for cross-site clients.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  try {
    await verifyCognitoBearer(req.headers['authorization']);

    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const text = typeof body.text === 'string' ? body.text : '';
    if (text.length < 20) {
      res
        .status(400)
        .json({ message: 'text must be at least 20 characters long' });
      return;
    }
    if (text.length > 20000) {
      res
        .status(400)
        .json({ message: 'text must be at most 20000 characters long' });
      return;
    }

    const result = await analyze(text);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res
        .status(401)
        .json({ message: err.message, error: 'Unauthorized', statusCode: 401 });
      return;
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('analyze failed:', msg);
    res.status(500).json({ message: 'Analysis failed. Please retry.' });
  }
}
