import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

export type RealDbTestAppContext = {
  app: INestApplication;
  dataSource: DataSource;
  resetDatabase: () => Promise<void>;
};

function configureRealDbTestEnv(): void {
  process.env.PORT = '3000';
  process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5433/ordex';
  process.env.DB_SYNCHRONIZE = 'false';
  process.env.CORS_ORIGIN = 'http://localhost:3000,http://localhost:3001';
  process.env.THROTTLE_TTL = '60000';
  process.env.THROTTLE_LIMIT = '500';
  process.env.JWT_SECRET = 'docker-secret-change-me';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.ADMIN_USERNAME = 'admin';
  process.env.ADMIN_PASSWORD = 'admin';
}

function applyTestingAppSetup(app: INestApplication): void {
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
}

export async function createRealDbTestApp(): Promise<RealDbTestAppContext> {
  configureRealDbTestEnv();

  const { default: migrationDataSource } =
    require('../../database/data-source') as {
      default: DataSource;
    };
  const { Test } =
    require('@nestjs/testing') as typeof import('@nestjs/testing');
  const { AppModule } =
    require('../../app.module') as typeof import('../../app.module');

  if (!migrationDataSource.isInitialized) {
    await migrationDataSource.initialize();
  }

  await migrationDataSource.runMigrations();
  await migrationDataSource.destroy();

  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = testingModule.createNestApplication();

  applyTestingAppSetup(app);
  await app.init();

  const dataSource = app.get(DataSource);

  return {
    app,
    dataSource,
    resetDatabase: async () => {
      await dataSource.query(
        'TRUNCATE TABLE "orders" RESTART IDENTITY CASCADE;',
      );
    },
  };
}
