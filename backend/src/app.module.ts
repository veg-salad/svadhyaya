import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AnalysisModule } from './analysis/analysis.module';

/**
 * Root application module. Loads environment configuration and wires
 * feature modules.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AnalysisModule,
  ],
})
export class AppModule {}
