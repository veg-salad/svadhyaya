import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import type {
  AnalyzeResponse,
  EmicAlignmentFinding,
  ScholarBrief,
} from './dto/analyze.dto';

/**
 * System prompt used for every /api/analyze request.
 * Instructs the model to speak from an emic, Indic-scholar perspective and to
 * return JSON conforming to our schema.
 */
const SYSTEM_PROMPT = [
  'You are an expert Indic scholar assistant at Bodha Research Think Tank.',
  'You analyze texts from an emic, Indic perspective.',
  'Examine the user text for orientalist/colonized framing (e.g. calling',
  "Puranas 'mythology', calling Dharma 'religion', calling Jati 'caste system',",
  'or applying Enlightenment political frameworks to Hindu institutions).',
  'Return a JSON matching the required schema with emic corrections and a',
  'structured scholar research brief.',
  '',
  'Respond with a single JSON object shaped exactly as:',
  '{',
  '  "emicAlignments": [',
  '    {',
  '      "originalTerm": string,',
  '      "suggestedTerm": string,',
  '      "context": string,',
  '      "explanation": string',
  '    }',
  '  ],',
  '  "scholarBrief": {',
  '    "executiveSummary": string,',
  '    "coreIndicThemes": string[],',
  '    "recommendedResearchAngles": string[]',
  '  }',
  '}',
  '',
  'Rules:',
  '- Include every colonized/orientalist term you find; if none, return an empty array.',
  '- "context" must quote the exact phrase from the user text where the term appears.',
  '- "explanation" must be 1-3 sentences and rooted in Indic epistemology.',
  '- Keep "executiveSummary" under 120 words.',
  '- "coreIndicThemes" and "recommendedResearchAngles" should each contain 3-6 items.',
  '- Use precise Samskrit/Indic vocabulary transliterated in Roman script (e.g. Itihasa, Dharma, Sampradaya, Jati, Varna).',
].join('\n');

/**
 * Service that calls an OpenAI-compatible chat completion endpoint in JSON
 * mode and normalizes the response into our {@link AnalyzeResponse} shape.
 */
@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly client: OpenAI;
  private readonly model: string;

  /**
   * Reads OpenAI credentials from configuration and constructs the SDK client.
   * @param config Nest ConfigService providing env vars.
   */
  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set. Copy .env.example to .env.');
    }
    const baseURL = this.config.get<string>('OPENAI_BASE_URL') || undefined;
    this.model = this.config.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
    this.client = new OpenAI({ apiKey, baseURL });
  }

  /**
   * Runs the two-stage analysis (Drishti-Shuddhi + Shodharthi) via a single
   * JSON-mode chat completion call.
   * @param text The raw research passage submitted by the user.
   */
  async analyze(text: string): Promise<AnalyzeResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new Error('Model returned an empty response.');
      }
      return this.parseResponse(raw);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`analyze() failed: ${message}`);
      throw new InternalServerErrorException(
        'Analysis failed. Please retry in a moment.',
      );
    }
  }

  /**
   * Parses and validates the raw model output into an {@link AnalyzeResponse}.
   * Missing fields are coerced to safe defaults so the UI can always render.
   * @param raw JSON text returned by the model.
   */
  private parseResponse(raw: string): AnalyzeResponse {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Model returned invalid JSON.');
    }

    const obj = (parsed ?? {}) as Record<string, unknown>;
    const alignments = Array.isArray(obj.emicAlignments)
      ? (obj.emicAlignments as unknown[]).map((entry) => this.toAlignment(entry))
      : [];
    const brief = this.toBrief(obj.scholarBrief);
    return { emicAlignments: alignments, scholarBrief: brief };
  }

  /**
   * Normalizes a single alignment entry, coercing unknown fields to strings.
   * @param value Raw entry from the model's JSON output.
   */
  private toAlignment(value: unknown): EmicAlignmentFinding {
    const v = (value ?? {}) as Record<string, unknown>;
    return {
      originalTerm: String(v.originalTerm ?? ''),
      suggestedTerm: String(v.suggestedTerm ?? ''),
      context: String(v.context ?? ''),
      explanation: String(v.explanation ?? ''),
    };
  }

  /**
   * Normalizes the scholar brief block, ensuring array fields exist.
   * @param value Raw brief object from the model's JSON output.
   */
  private toBrief(value: unknown): ScholarBrief {
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
}
