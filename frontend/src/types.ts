export interface EmicAlignment {
  originalTerm: string;
  suggestedTerm: string;
  context: string;
  explanation: string;
}

export interface ScholarBrief {
  executiveSummary: string;
  coreIndicThemes: string[];
  recommendedResearchAngles: string[];
}

export interface AnalyzeResponse {
  emicAlignments: EmicAlignment[];
  scholarBrief: ScholarBrief;
}

export type AnalyzeStage = 'idle' | 'emic' | 'brief' | 'done';
