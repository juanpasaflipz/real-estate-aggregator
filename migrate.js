import knex from 'knex';
import knexConfig from './knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('Migrations completed successfully!');
    
    const currentVersion = await db.migrate.currentVersion();
    console.log('Current migration version:', currentVersion);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();