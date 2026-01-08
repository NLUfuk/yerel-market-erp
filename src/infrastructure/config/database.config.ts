import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: join(__dirname, '../../../.env') });

/**
 * Database Configuration
 * Supports both SQL Server and SQLite
 * Reads from environment variables
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE || 'mssql';
  
  // Debug: Log environment variables
  console.log('🔍 Database Config Debug:');
  console.log('  DB_TYPE:', process.env.DB_TYPE);
  console.log('  DB_HOST:', process.env.DB_HOST);
  console.log('  DB_DATABASE:', process.env.DB_DATABASE);
  console.log('  DB_USERNAME:', process.env.DB_USERNAME ? '***' : 'undefined');
  
  // SQL Server Configuration
  if (dbType === 'mssql') {
    const hostConfig = process.env.DB_HOST || '(localdb)\\MSSQLLocalDB';
    const database = process.env.DB_DATABASE || 'yerel-market-erp';
    console.log('  Using hostConfig:', hostConfig);
    console.log('  Using database:', database);
    const encrypt = process.env.DB_ENCRYPT !== 'false';
    const trustCert = process.env.DB_TRUST_CERT === 'true';
    
    // LocalDB için connection string kullan
    let config: TypeOrmModuleOptions;
    
    if (hostConfig.includes('localdb') || hostConfig.includes('LocalDB')) {
      // LocalDB için connection string kullan
      // TypeORM url format: mssql://server/database veya connection string
      const connectionString = `mssql://${hostConfig}/${database}?trustedConnection=true&trustServerCertificate=${trustCert}&encrypt=${encrypt}`;
      config = {
        type: 'mssql',
        url: connectionString,
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
        entities: [__dirname + '/../persistence/typeorm/entities/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../persistence/typeorm/migrations/**/*{.ts,.js}'],
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
        
        config = {
          type: 'mssql',
          url: url,
          synchronize: process.env.DB_SYNCHRONIZE === 'true',
          logging: process.env.DB_LOGGING === 'true',
          entities: [__dirname + '/../persistence/typeorm/entities/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/../persistence/typeorm/migrations/**/*{.ts,.js}'],
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
        config = {
          type: 'mssql',
          host: host,
          port: port,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: database,
          synchronize: process.env.DB_SYNCHRONIZE === 'true',
          logging: process.env.DB_LOGGING === 'true',
          entities: [__dirname + '/../persistence/typeorm/entities/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/../persistence/typeorm/migrations/**/*{.ts,.js}'],
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
    
    return config;
  }
  
  // SQLite Configuration (fallback)
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

