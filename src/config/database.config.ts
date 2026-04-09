import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { parseBoolean } from './env.utils';

export function createDatabaseConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: configService.getOrThrow<string>('DATABASE_URL'),
    autoLoadEntities: true,
    synchronize: parseBoolean(
      configService.get<string>('DB_SYNCHRONIZE'),
      false,
    ),
  };
}
