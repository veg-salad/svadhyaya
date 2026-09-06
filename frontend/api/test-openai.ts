import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

/** Diagnostic: does the `openai` package load and instantiate. */
export default function handler(
  _req: VercelRequest,
  res: VercelResponse,
): void {
  try {
    const c = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    res.status(200).json({ ok: true, hasClient: !!c });
  } catch (e) {
    res.status(500).json({
      ok: false,
      err: e instanceof Error ? e.message : String(e),
    });
  }
}
