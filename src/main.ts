import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });

  app.use('/public', express.static(path.join(__dirname, '..', 'public')));

  await app.listen(3000);
}
bootstrap();
