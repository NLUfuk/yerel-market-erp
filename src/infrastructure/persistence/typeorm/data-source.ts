import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../../../../.env') });

/**
 * DataSource configuration for TypeORM CLI
 * Used for migrations and seeding
 * Uses SQLite for simplicity
 */
const databasePath = process.env.DB_DATABASE || join(__dirname, '../../../../database.sqlite');

const dataSourceConfig: DataSourceOptions = {
  type: 'better-sqlite3',
  database: databasePath,
  synchronize: false, // Never use synchronize in production
  logging: process.env.DB_LOGGING === 'true',
  entities: [join(__dirname, 'entities/**/*.typeorm-entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/**/*{.ts,.js}')],
  migrationsRun: false,
};

export const AppDataSource = new DataSource(dataSourceConfig);

