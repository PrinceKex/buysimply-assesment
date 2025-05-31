import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

/**
 * Module for Redis integration
 * Provides Redis caching and rate limiting functionality
 */
export interface RedisModuleOptions {
  host: string;
  port: number;
  retryStrategy?: (times: number) => number | Error | null;
}

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule {
  static forRoot(options?: Partial<RedisModuleOptions>): DynamicModule {
    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'REDIS_OPTIONS',
          useFactory: (configService: ConfigService): RedisModuleOptions => ({
            host: options?.host || configService.get<string>('REDIS_HOST', 'localhost'),
            port: options?.port || configService.get<number>('REDIS_PORT', 6379),
            retryStrategy: options?.retryStrategy || ((retries: number) => {
              if (retries > 5) {
                return new Error('Max reconnection attempts reached');
              }
              return Math.min(retries * 100, 2000);
            })
          }),
          inject: [ConfigService]
        },
        RedisService
      ],
      exports: [RedisService]
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<Partial<RedisModuleOptions>> | Partial<RedisModuleOptions>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: RedisModule,
      imports: [...(options.imports || []), ConfigModule],
      providers: [
        {
          provide: 'REDIS_OPTIONS',
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            const configService = args[args.length - 1] as ConfigService;

            return {
              host: config.host || configService.get<string>('REDIS_HOST', 'localhost'),
              port: config.port || configService.get<number>('REDIS_PORT', 6379),
              retryStrategy: config.retryStrategy || ((retries: number) => {
                if (retries > 5) {
                  return new Error('Max reconnection attempts reached');
                }
                return Math.min(retries * 100, 2000);
              })
            };
          },
          inject: [...(options.inject || []), ConfigService]
        },
        RedisService
      ],
      exports: [RedisService]
    };
  }
}
