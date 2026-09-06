import type { VercelRequest, VercelResponse } from '@vercel/node';

import { SYSTEM_PROMPT } from './_lib/prompt';

/** Diagnostic: does `_lib/prompt` load. */
export default function handler(
  _req: VercelRequest,
  res: VercelResponse,
): void {
  res.status(200).json({ ok: true, promptLen: SYSTEM_PROMPT.length });
}
