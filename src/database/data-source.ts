import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { parseBoolean } from '../config/env.utils';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: parseBoolean(process.env.DB_SYNCHRONIZE, false),
  entities: [join(__dirname, '..', 'orders', 'entities', '*.entity.{js,ts}')],
  migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
  migrationsTableName: 'typeorm_migrations',
});
