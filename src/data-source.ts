import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

// Load environment variables
dotenv.config();

// Create a new ConfigService instance
const configService = new ConfigService();

const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: parseInt(configService.get('DATABASE_PORT') || '5432'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
  poolSize: parseInt(configService.get('DATABASE_POOL_SIZE') || '5'),
});

export default dataSource;
