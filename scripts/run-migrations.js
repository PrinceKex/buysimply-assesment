#!/usr/bin/env node

require('dotenv').config();
const { DataSource } = require('typeorm');
const path = require('path');

// Set debug mode for TypeORM
process.env.DEBUG = 'typeorm:*';

console.log('=== Starting Migration Process ===');
console.log('Environment variables:');
console.log('- DATABASE_HOST:', process.env.DATABASE_HOST || 'not set');
console.log('- DATABASE_PORT:', process.env.DATABASE_PORT || 'not set');
console.log('- DATABASE_USER:', process.env.DATABASE_USER ? '***' : 'not set');
console.log('- DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? '***' : 'not set');
console.log('- DATABASE_NAME:', process.env.DATABASE_NAME || 'not set');
console.log('----------------------------------');

const waitMs = 10000; // 10 seconds

// Wait for PostgreSQL to be ready
console.log('Waiting for PostgreSQL to be ready...');
const waitForPostgres = async () => {
  const maxAttempts = 10;
  let attempts = 0;

  console.log(`Waiting for PostgreSQL to be ready (max ${maxAttempts} attempts)...`);
  
  while (attempts < maxAttempts) {
    try {
      console.log(`Attempt ${attempts + 1}/${maxAttempts}: Connecting to PostgreSQL...`);
      
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'postgres',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: 'postgres', // Connect to default database first
        synchronize: false,
        logging: ['error', 'schema', 'warn', 'info', 'log'],
        extra: {
          ssl: false,
          connectionLimit: 5,
          idleTimeoutMillis: 30000,
          connectTimeout: 30000
        }
      });

      await dataSource.initialize();
      console.log('✅ Successfully connected to PostgreSQL!');
      
      // Test the connection with a simple query
      const result = await dataSource.query('SELECT 1 as test');
      console.log('✅ PostgreSQL connection test query result:', result);
      
      await dataSource.destroy();
      return true;
    } catch (error) {
      console.error(`❌ Attempt ${attempts + 1} failed:`, error.message);
      console.error('Error details:', error);
      attempts++;
      
      if (attempts < maxAttempts) {
        console.log(`⏳ Waiting ${waitMs/1000} seconds before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
      }
    }
  }
  
  console.error(`❌ Failed to connect to PostgreSQL after ${maxAttempts} attempts`);
  return false;
};

// Main execution
(async () => {
  try {
    console.log('=== Starting Database Setup ===');
    
    // Wait for PostgreSQL to be ready
    const isPostgresReady = await waitForPostgres();
    if (!isPostgresReady) {
      throw new Error('PostgreSQL is not ready after multiple attempts');
    }

    // First connect to default postgres database
    console.log('\n=== Setting up Admin Connection ===');
    const adminDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: 'postgres',
      synchronize: false,
      logging: ['error', 'schema', 'warn', 'info', 'log'],
      extra: {
        ssl: false,
        connectionLimit: 5,
        idleTimeoutMillis: 30000,
        connectTimeout: 30000
      }
    });

    await adminDataSource.initialize();
    console.log('✅ Admin database connection established');
    
    // Drop and recreate the database with retry logic
    const dbName = process.env.DATABASE_NAME || 'buysimply';
    let success = false;
    const maxAttempts = 3;
    let attempts = 0;

    console.log(`\n=== Setting up Database: ${dbName} ===`);
    
    while (!success && attempts < maxAttempts) {
      const queryRunner = adminDataSource.createQueryRunner();
      
      try {
        console.log(`\n🔧 Attempt ${attempts + 1}/${maxAttempts}: Dropping database if it exists...`);
        await queryRunner.query(`DROP DATABASE IF EXISTS \"${dbName}\"`);
        
        console.log(`🔧 Attempt ${attempts + 1}/${maxAttempts}: Creating database...`);
        await queryRunner.query(`CREATE DATABASE \"${dbName}\"`);
        
        // Grant permissions to the database user
        const dbUser = process.env.DATABASE_USER || 'postgres';
        console.log(`🔧 Granting permissions to user '${dbUser}'...`);
        await queryRunner.query(`GRANT ALL PRIVILEGES ON DATABASE \"${dbName}\" TO \"${dbUser}\"`);
        
        console.log(`✅ Database ${dbName} created successfully!`);
        success = true;
      } catch (error) {
        console.error(`❌ Attempt ${attempts + 1} failed:`, error.message);
        attempts++;
        
        if (attempts < maxAttempts) {
          console.log(`⏳ Waiting ${waitMs/1000} seconds before retrying...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
        }
      } finally {
        await queryRunner.release();
      }
    }

    if (!success) {
      throw new Error(`❌ Failed to create database after ${maxAttempts} attempts`);
    }
    
    await adminDataSource.destroy();
    console.log('✅ Admin connection closed');

    // Now connect to the newly created database
    console.log('\n=== Connecting to Application Database ===');
    
    // Build the project to generate JavaScript files
    console.log('🔨 Building the project...');
    const { execSync } = require('child_process');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Project built successfully');
    } catch (error) {
      console.error('❌ Failed to build project:', error);
      throw error;
    }
    
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: dbName,
      entities: [
        path.join(__dirname, '../dist/**/*.entity.js')
      ],
      migrations: [
        path.join(__dirname, '../dist/src/migrations/*.js')
      ],
      migrationsRun: false,
      synchronize: false,
      logging: ['error', 'schema', 'warn', 'info', 'log', 'migration', 'query'],
      extra: {
        ssl: false,
        connectionLimit: 5,
        idleTimeoutMillis: 30000,
        connectTimeout: 30000
      }
    });

    console.log('🔌 Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connection established successfully!');

    // Enable UUID extension if not exists
    console.log('\n=== Checking for Required Extensions ===');
    try {
      console.log('🔧 Enabling uuid-ossp extension...');
      await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ uuid-ossp extension enabled');
    } catch (extError) {
      console.warn('⚠️ Could not enable uuid-ossp extension:', extError.message);
      console.warn('⚠️ Continuing, but UUID functions might not be available');
    }

    // Run migrations
    console.log('\n=== Running Migrations ===');
    try {
      console.log('🔄 Checking for pending migrations...');
      const migrations = await dataSource.runMigrations();
      
      if (migrations && migrations.length > 0) {
        console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
        migrations.forEach(migration => {
          console.log(`   - ${migration.name} (${migration.timestamp})`);
        });
      } else {
        console.log('ℹ️ No pending migrations to run');
      }
      
      console.log('\n=== Migration Process Completed Successfully ===');
    } catch (migrationError) {
      console.error('❌ Error running migrations:', migrationError);
      throw migrationError;
    } finally {
      console.log('\n=== Cleaning Up ===');
      console.log('🔌 Closing database connection...');
      await dataSource.destroy();
      console.log('✅ Database connection closed');
    }
    
    console.log('\n✨ Database setup completed successfully! ✨');
    process.exit(0);
  } catch (error) {
    console.error('\n❌❌❌ FATAL ERROR DURING MIGRATION ❌❌❌');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('\nAdditional error details:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
})();
