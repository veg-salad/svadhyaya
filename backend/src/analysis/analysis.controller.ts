import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { CognitoAuthGuard } from '../auth/cognito-auth.guard';

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
   * Handles `POST /api/analyze`. Requires a Cognito bearer token.
   * @param body Validated request payload.
   */
  @Post()
  @HttpCode(200)
  @UseGuards(CognitoAuthGuard)
  async analyze(@Body() body: AnalyzeRequestDto): Promise<AnalyzeResponse> {
    return this.service.analyze(body.text);
  }
}
