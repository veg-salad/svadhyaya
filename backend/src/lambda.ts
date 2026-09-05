import 'reflect-metadata';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import express, { type Express } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

type Handler = (
  event: APIGatewayProxyEventV2,
  context: Context,
) => Promise<APIGatewayProxyResultV2>;

let cached: Handler | undefined;

/** Boots Nest once per Lambda container and returns a serverless-express handler. */
async function bootstrap(): Promise<Handler> {
  const expressApp: Express = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { cors: true, logger: ['error', 'warn', 'log'] },
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return serverlessExpress({ app: expressApp }) as unknown as Handler;
}

export const handler: Handler = async (event, context) => {
  cached ??= await bootstrap();
  return cached(event, context);
};
