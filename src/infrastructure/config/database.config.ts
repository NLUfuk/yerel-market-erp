import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

/**
 * Database Configuration
 * Uses SQLite for simplicity - no server setup required
 * Reads from environment variables
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  // SQLite database file path
  // Default: database.sqlite in project root
  // Can be overridden with DB_DATABASE env variable
  const databasePath = process.env.DB_DATABASE || join(process.cwd(), 'database.sqlite');

  const config: TypeOrmModuleOptions = {
    type: 'better-sqlite3',
    database: databasePath,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    entities: [__dirname + '/../persistence/typeorm/entities/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../persistence/typeorm/migrations/**/*{.ts,.js}'],
    migrationsRun: false,
  };

  return config;
};

