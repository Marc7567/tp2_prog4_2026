import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { loadEnvFile } from 'node:process';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  loadEnvFile('.env');

  const { AppModule } = require('./app.module');
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    }),
  );

  app.enableCors({
    // FRONTEND_ORIGIN=http://localhost:4300
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4300',
    credentials: true
  });
  // PORT=3200
  await app.listen(process.env.PORT ?? 3200);
}

void bootstrap();