import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

export interface RedisModuleOptions {
  host: string;
  port: number;
  retryStrategy?: (times: number) => number | Error | null;
}

export const REDIS_OPTIONS = 'REDIS_OPTIONS';

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    const redisOptionsProvider: Provider = {
      provide: REDIS_OPTIONS,
      useValue: options
    };

    return {
      module: RedisModule,
      providers: [
        redisOptionsProvider,
        RedisService
      ],
      exports: [RedisService]
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<RedisModuleOptions> | RedisModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const redisOptionsProvider: Provider = {
      provide: REDIS_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || []
    };

    return {
      module: RedisModule,
      imports: options.imports || [],
      providers: [
        redisOptionsProvider,
        RedisService
      ],
      exports: [RedisService]
    };
  }
}
