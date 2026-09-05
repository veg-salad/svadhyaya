import { Module } from '@nestjs/common';

import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

/**
 * Feature module for the text analysis pipeline
 * (Emic Alignment + Scholar Brief).
 */
@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
