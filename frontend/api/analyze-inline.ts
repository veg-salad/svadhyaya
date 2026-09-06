import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export const config = { maxDuration: 60 };

const SYSTEM_PROMPT = [
  'You are an expert Indic scholar assistant at Bodha Research Think Tank.',
  'You analyze texts from an emic, Indic perspective.',
  "Examine the user text for orientalist/colonized framing (e.g. calling Puranas 'mythology', calling Dharma 'religion', calling Jati 'caste system', or applying Enlightenment political frameworks to Hindu institutions).",
  'Return a JSON matching the required schema with emic corrections and a structured scholar research brief.',
  '',
  'Respond with a single JSON object shaped exactly as:',
  '{',
  '  "emicAlignments": [{ "originalTerm": string, "suggestedTerm": string, "context": string, "explanation": string }],',
  '  "scholarBrief": { "executiveSummary": string, "coreIndicThemes": string[], "recommendedResearchAngles": string[] }',
  '}',
  '',
  'Rules:',
  '- Include every colonized/orientalist framing you find (not only single words \u2014 also imported analytical frameworks like Durkheimian, Weberian, Cartesian, Enlightenment categories, folk/tribal typologies, market metaphors, etc.).',
  '- If no orientalist framing is present, return an empty emicAlignments array.',
  '- "context" must quote the exact phrase from the user text where the term appears.',
  '- "explanation" must be 1-3 sentences and rooted in Indic epistemology.',
  '- Keep "executiveSummary" under 120 words.',
  '- "coreIndicThemes" and "recommendedResearchAngles" should each contain 3-6 items.',
  '- Use precise Samskrit/Indic vocabulary transliterated in Roman script (e.g. Itihasa, Dharma, Sampradaya, Jati, Varna).',
].join('\n');

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let cachedIssuer = '';
let cachedClientId = '';

async function verifyBearer(auth: string | string[] | undefined): Promise<void> {
  const header = Array.isArray(auth) ? auth[0] : auth;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing bearer token.');
  }
  const token = header.slice('Bearer '.length).trim();
  const region =
    process.env.COGNITO_REGION || process.env.AWS_REGION || 'ap-south-1';
  const poolId = process.env.COGNITO_USER_POOL_ID || '';
  const clientId = process.env.COGNITO_CLIENT_ID || '';
  if (!poolId || !clientId) {
    throw new Error('Cognito env vars missing.');
  }
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
  } catch {
    throw new UnauthorizedError('Invalid or expired token.');
  }
}

let cachedOpenAI: OpenAI | null = null;
function openai(): OpenAI {
  if (cachedOpenAI) return cachedOpenAI;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');
  cachedOpenAI = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
  return cachedOpenAI;
}

async function runAnalysis(text: string): Promise<unknown> {
  const model = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
  const supportsTemperature = !/^gpt-5/i.test(model);
  const completion = await openai().chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
    ...(supportsTemperature ? { temperature: 0.4 } : {}),
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Model returned empty response.');
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const alignments = Array.isArray(parsed.emicAlignments)
    ? (parsed.emicAlignments as unknown[]).map((v) => {
        const o = (v ?? {}) as Record<string, unknown>;
        return {
          originalTerm: String(o.originalTerm ?? ''),
          suggestedTerm: String(o.suggestedTerm ?? ''),
          context: String(o.context ?? ''),
          explanation: String(o.explanation ?? ''),
        };
      })
    : [];
  const b = (parsed.scholarBrief ?? {}) as Record<string, unknown>;
  return {
    emicAlignments: alignments,
    scholarBrief: {
      executiveSummary: String(b.executiveSummary ?? ''),
      coreIndicThemes: Array.isArray(b.coreIndicThemes)
        ? (b.coreIndicThemes as unknown[]).map((s) => String(s))
        : [],
      recommendedResearchAngles: Array.isArray(b.recommendedResearchAngles)
        ? (b.recommendedResearchAngles as unknown[]).map((s) => String(s))
        : [],
    },
  };
}

class UnauthorizedError extends Error {}

/** POST /api/analyze \u2014 verifies Cognito, calls the LLM, returns the analysis. */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method === 'OPTIONS') {
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
    await verifyBearer(req.headers['authorization']);
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
    const result = await runAnalysis(text);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({
        message: err.message,
        error: 'Unauthorized',
        statusCode: 401,
      });
      return;
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('analyze failed:', msg);
    res.status(500).json({ message: 'Analysis failed. Please retry.' });
  }
}
