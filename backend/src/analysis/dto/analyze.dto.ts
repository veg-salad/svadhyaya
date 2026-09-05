import { IsString, MinLength, MaxLength } from 'class-validator';

/** Request payload for POST /api/analyze. */
export class AnalyzeRequestDto {
  @IsString()
  @MinLength(20, { message: 'Text must be at least 20 characters to analyze.' })
  @MaxLength(20000, { message: 'Text must be under 20,000 characters.' })
  text!: string;
}

/** A single emic-alignment finding. */
export interface EmicAlignmentFinding {
  originalTerm: string;
  suggestedTerm: string;
  context: string;
  explanation: string;
}

/** Structured scholar research brief. */
export interface ScholarBrief {
  executiveSummary: string;
  coreIndicThemes: string[];
  recommendedResearchAngles: string[];
}

/** Full analysis response returned by POST /api/analyze. */
export interface AnalyzeResponse {
  emicAlignments: EmicAlignmentFinding[];
  scholarBrief: ScholarBrief;
}
