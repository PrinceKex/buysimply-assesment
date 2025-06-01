import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

/**
 * Root module of the application
 * Configures and imports all necessary modules for the application
 */
@Module({
	/**
	 * Module configuration
	 */
	imports: [
		/**
		 * Configuration module with global settings
		 * Loads environment variables from .env files
		 */
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [".env.development", ".env"],
		}),
		/**
		 * Database configuration using TypeORM
		 * Connects to PostgreSQL database
		 */
		TypeOrmModule.forRoot({
			type: "postgres",
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT),
			username: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			entities: [__dirname + "/**/*.entity{.ts,.js}"],
			synchronize: false,
			migrationsRun: true,
			migrations: [__dirname + "/migrations/*{.ts,.js}"],
			migrationsTableName: "typeorm_migrations",
			logging: process.env.NODE_ENV === "development",
			poolSize: parseInt(process.env.DATABASE_POOL_SIZE) || 5,
		}),
		/**
		 * Redis module for caching and rate limiting
		 */
		RedisModule.forRoot({
			host: process.env.REDIS_HOST || 'redis',
			port: parseInt(process.env.REDIS_PORT || '6379', 10),
    }),
    


		/**
		 * Health check module
		 * Provides health check endpoints
		 */
		HealthModule,

		/**
		 * Users module
		 * Manages user-related operations and roles
		 */
		UsersModule,

		/**
		 * Authentication module
		 * Handles JWT authentication and authorization
		 */
		AuthModule,

		/**
		 * Tasks module
		 * Handles task management operations
		 */
		TasksModule,
	],
})
export class AppModule {}
