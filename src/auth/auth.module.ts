import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RateLimiterModule } from 'nestjs-rate-limiter';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    RateLimiterModule.registerAsync({
      imports: [ConfigModule, RedisModule],
      useFactory: async (configService: ConfigService, redisService: RedisService) => ({
        storeClient: {
          get: async () => {
            await redisService.ensureConnected();
            return redisService.getClient();
          }
        },
        points: configService.get<number>('RATE_LIMIT_POINTS', 100),
        duration: configService.get<number>('RATE_LIMIT_DURATION', 60),
        blockDuration: configService.get<number>('RATE_LIMIT_BLOCK_DURATION', 300),
        keyPrefix: configService.get<string>('RATE_LIMIT_KEY_PREFIX', 'auth_rate_limit')
      }),
      inject: [ConfigService, RedisService]
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenBlacklistService],
  exports: [AuthService, TokenBlacklistService],
})
export class AuthModule {}
