import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../../../../.env') });

/**
 * DataSource configuration for TypeORM CLI
 * Used for migrations and seeding
 * Supports both SQL Server and SQLite
 */
const dbType = process.env.DB_TYPE || 'mssql';

let dataSourceConfig: DataSourceOptions;

if (dbType === 'mssql') {
  // SQL Server Configuration
  const hostConfig = process.env.DB_HOST || '(localdb)\\MSSQLLocalDB';
  const database = process.env.DB_DATABASE || 'yerel-market-erp';
  const encrypt = process.env.DB_ENCRYPT !== 'false';
  const trustCert = process.env.DB_TRUST_CERT === 'true';
  
  // LocalDB için connection string kullan
  if (hostConfig.includes('localdb') || hostConfig.includes('LocalDB')) {
    // LocalDB için connection string kullan
    // TypeORM url format: mssql://server/database veya connection string
    const connectionString = `mssql://${hostConfig}/${database}?trustedConnection=true&trustServerCertificate=${trustCert}&encrypt=${encrypt}`;
    dataSourceConfig = {
      type: 'mssql',
      url: connectionString,
      synchronize: false, // Never use synchronize in production
      logging: process.env.DB_LOGGING === 'true',
      entities: [join(__dirname, 'entities/**/*.typeorm-entity{.ts,.js}')],
      migrations: [join(__dirname, 'migrations/**/*{.ts,.js}')],
      migrationsRun: false,
      options: {
        encrypt: encrypt,
        trustServerCertificate: trustCert,
        enableArithAbort: true,
      },
      extra: {
        trustServerCertificate: trustCert,
        enableArithAbort: true,
      },
    };
  } else {
    // Named instance veya default instance için
    // Port numarası sabit olduğu için instance lookup'a gerek yok
    let host: string;
    let instanceName: string | undefined;
    const port = parseInt(process.env.DB_PORT || '1433', 10);
    
    if (hostConfig.includes('\\')) {
      // Named instance: host\instance
      const parts = hostConfig.split('\\');
      // Bilgisayar adı yerine localhost kullan (aynı makinede çalışıyorsak)
      host = parts[0].toLowerCase() === 'localhost' || parts[0].toLowerCase() === '127.0.0.1' 
        ? parts[0] 
        : 'localhost';
      instanceName = parts[1];
    } else {
      // Default instance: sadece host
      host = hostConfig.toLowerCase() === 'localhost' || hostConfig.toLowerCase() === '127.0.0.1'
        ? hostConfig
        : 'localhost';
    }

    // Port numarası ile doğrudan bağlantı (instance lookup'a gerek yok)
    // Windows Authentication için connection string kullan
    const useWindowsAuth = !process.env.DB_USERNAME && !process.env.DB_PASSWORD;
    
    if (useWindowsAuth) {
      // Windows Authentication için connection string kullan
      // TypeORM url format: mssql://server:port/database?options
      const serverPart = instanceName ? `${host}\\${instanceName}` : host;
      const url = `mssql://${serverPart}:${port}/${database}?trustedConnection=true&trustServerCertificate=${trustCert}&encrypt=${encrypt}`;
      
      dataSourceConfig = {
        type: 'mssql',
        url: url,
        synchronize: false, // Never use synchronize in production
        logging: process.env.DB_LOGGING === 'true',
        entities: [join(__dirname, 'entities/**/*.typeorm-entity{.ts,.js}')],
        migrations: [join(__dirname, 'migrations/**/*{.ts,.js}')],
        migrationsRun: false,
        options: {
          encrypt: encrypt,
          trustServerCertificate: trustCert,
          enableArithAbort: true,
        },
        extra: {
          trustServerCertificate: trustCert,
          enableArithAbort: true,
        },
      };
    } else {
      // SQL Server Authentication
      dataSourceConfig = {
        type: 'mssql',
        host: host,
        port: port,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: database,
        synchronize: false, // Never use synchronize in production
        logging: process.env.DB_LOGGING === 'true',
        entities: [join(__dirname, 'entities/**/*.typeorm-entity{.ts,.js}')],
        migrations: [join(__dirname, 'migrations/**/*{.ts,.js}')],
        migrationsRun: false,
        options: {
          encrypt: encrypt,
          trustServerCertificate: trustCert,
          enableArithAbort: true,
          ...(instanceName && { instanceName: instanceName }),
        },
        extra: {
          trustServerCertificate: trustCert,
          enableArithAbort: true,
        },
      };
    }
  }
} else {
  // SQLite Configuration (fallback)
  const databasePath = process.env.DB_DATABASE || join(__dirname, '../../../../database.sqlite');
  dataSourceConfig = {
    type: 'better-sqlite3',
    database: databasePath,
    synchronize: false, // Never use synchronize in production
    logging: process.env.DB_LOGGING === 'true',
    entities: [join(__dirname, 'entities/**/*.typeorm-entity{.ts,.js}')],
    migrations: [join(__dirname, 'migrations/**/*{.ts,.js}')],
    migrationsRun: false,
  };
}

export const AppDataSource = new DataSource(dataSourceConfig);

