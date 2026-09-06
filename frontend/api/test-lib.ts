import type { VercelRequest, VercelResponse } from '@vercel/node';

import { analyze } from './_lib/analyze';

/** Diagnostic: does `_lib/analyze` load at all. */
export default function handler(
  _req: VercelRequest,
  res: VercelResponse,
): void {
  res.status(200).json({ ok: true, analyzeType: typeof analyze });
}
