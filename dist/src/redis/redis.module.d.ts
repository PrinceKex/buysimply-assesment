import { DynamicModule } from '@nestjs/common';
export interface RedisModuleOptions {
    host: string;
    port: number;
    retryStrategy?: (times: number) => number | Error | null;
}
export declare class RedisModule {
    static forRoot(options?: Partial<RedisModuleOptions>): DynamicModule;
    static forRootAsync(options: {
        imports?: any[];
        useFactory: (...args: any[]) => Promise<Partial<RedisModuleOptions>> | Partial<RedisModuleOptions>;
        inject?: any[];
    }): DynamicModule;
}
