import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { parseOrigins } from './config/env.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT')) || 3000;
  const corsOrigins = parseOrigins(configService.get<string>('CORS_ORIGIN'), [
    'http://localhost:3000',
    'http://localhost:3001',
  ]);

  app.use(helmet());
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
}
void bootstrap();
