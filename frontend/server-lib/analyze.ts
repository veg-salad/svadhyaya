import OpenAI from 'openai';

import { SYSTEM_PROMPT } from './prompt';

interface EmicAlignment {
  originalTerm: string;
  suggestedTerm: string;
  context: string;
  explanation: string;
}

interface ScholarBrief {
  executiveSummary: string;
  coreIndicThemes: string[];
  recommendedResearchAngles: string[];
}

export interface AnalyzeResponse {
  emicAlignments: EmicAlignment[];
  scholarBrief: ScholarBrief;
}

let cachedClient: OpenAI | null = null;
function client(): OpenAI {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set on the server.');
  const baseURL = process.env.OPENAI_BASE_URL || undefined;
  cachedClient = new OpenAI({ apiKey, baseURL });
  return cachedClient;
}

/** Calls the configured model in JSON mode and normalises the response. */
export async function analyze(text: string): Promise<AnalyzeResponse> {
  const model = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
  // GPT-5 family requires the default temperature (1); older models accept 0.4.
  const supportsTemperature = !/^gpt-5/i.test(model);
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: text },
  ];
  const completion = await client().chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages,
    ...(supportsTemperature ? { temperature: 0.4 } : {}),
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Model returned an empty response.');
  return parseResponse(raw);
}

function parseResponse(raw: string): AnalyzeResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Model returned invalid JSON.');
  }
  const obj = (parsed ?? {}) as Record<string, unknown>;
  const alignments = Array.isArray(obj.emicAlignments)
    ? (obj.emicAlignments as unknown[]).map(toAlignment)
    : [];
  return { emicAlignments: alignments, scholarBrief: toBrief(obj.scholarBrief) };
}

function toAlignment(value: unknown): EmicAlignment {
  const v = (value ?? {}) as Record<string, unknown>;
  return {
    originalTerm: String(v.originalTerm ?? ''),
    suggestedTerm: String(v.suggestedTerm ?? ''),
    context: String(v.context ?? ''),
    explanation: String(v.explanation ?? ''),
  };
}

function toBrief(value: unknown): ScholarBrief {
  const v = (value ?? {}) as Record<string, unknown>;
  return {
    executiveSummary: String(v.executiveSummary ?? ''),
    coreIndicThemes: Array.isArray(v.coreIndicThemes)
      ? (v.coreIndicThemes as unknown[]).map((s) => String(s))
      : [],
    recommendedResearchAngles: Array.isArray(v.recommendedResearchAngles)
      ? (v.recommendedResearchAngles as unknown[]).map((s) => String(s))
      : [],
  };
}
