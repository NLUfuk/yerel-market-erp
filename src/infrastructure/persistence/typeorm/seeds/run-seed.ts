import { config } from 'dotenv';
import { join } from 'path';
import { runSeeds } from './default-roles.seed';
import { AppDataSource } from '../data-source';

// Load environment variables
config({ path: join(__dirname, '../../../../.env') });

/**
 * Seed script runner
 * Run with: npm run seed (basic seed)
 * Run with: npm run seed:demo (includes demo data)
 */
async function bootstrap() {
  // Check if --demo flag is passed
  const includeDemoData = process.argv.includes('--demo') || process.env.SEED_DEMO === 'true';

  try {
    await AppDataSource.initialize();
    console.log('📦 Database connection established');
    
    await runSeeds(AppDataSource, includeDemoData);
    
    await AppDataSource.destroy();
    console.log('✅ Seed script completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

bootstrap();

