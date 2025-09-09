import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import db from '../config/database';

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Connect to database
    await db.connect();
    
    // Get migration files
    const migrationsDir = join(__dirname, '../migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    
    // Run each migration
    for (const file of migrationFiles) {
      console.log(`📄 Running migration: ${file}`);
      
      const migrationPath = join(migrationsDir, file);
      const migrationSQL = readFileSync(migrationPath, 'utf8');
      
      await db.query(migrationSQL);
      console.log(`✅ Migration ${file} completed`);
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;
