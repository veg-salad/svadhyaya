import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { AnalysisService } from './analysis.service';
import { AnalyzeRequestDto, AnalyzeResponse } from './dto/analyze.dto';

/**
 * HTTP surface for the analysis pipeline. Exposes a single endpoint that
 * consumes raw text and returns emic alignments + scholar brief.
 */
@Controller('analyze')
export class AnalysisController {
  /**
   * Wires the controller to the analysis service.
   * @param service Underlying {@link AnalysisService}.
   */
  constructor(private readonly service: AnalysisService) {}

  /**
   * Handles `POST /api/analyze`.
   * @param body Validated request payload.
   */
  @Post()
  @HttpCode(200)
  async analyze(@Body() body: AnalyzeRequestDto): Promise<AnalyzeResponse> {
    return this.service.analyze(body.text);
  }
}
