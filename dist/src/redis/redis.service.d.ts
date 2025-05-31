import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisClientType as BaseRedisClientType } from 'redis';
import { RedisModuleOptions } from './redis.module';
type RedisClient = BaseRedisClientType<any, any, any>;
export interface RedisClientType {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, options?: {
        EX?: number;
    }) => Promise<string | null>;
    del: (key: string | string[]) => Promise<number>;
    exists: (key: string | string[]) => Promise<number>;
    expire: (key: string, seconds: number) => Promise<boolean>;
    keys: (pattern: string) => Promise<string[]>;
    ttl: (key: string) => Promise<number>;
    incr: (key: string) => Promise<number>;
    incrBy: (key: string, increment: number) => Promise<number>;
    multi: () => any;
    isOpen: boolean;
    isReady: boolean;
    connect: () => Promise<void>;
    quit: () => Promise<void>;
    ping: () => Promise<string>;
}
export declare class RedisService implements OnModuleInit, OnModuleDestroy, RedisClientType {
    private readonly options;
    private client;
    private isInitialized;
    private connectionPromise;
    constructor(options: RedisModuleOptions);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private initialize;
    ensureConnected(): Promise<void>;
    getClient(): RedisClient;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: {
        EX?: number;
    }): Promise<string | null>;
    del(key: string | string[]): Promise<number>;
    exists(key: string | string[]): Promise<number>;
    expire(key: string, seconds: number): Promise<boolean>;
    keys(pattern: string): Promise<string[]>;
    ttl(key: string): Promise<number>;
    incr(key: string): Promise<number>;
    incrBy(key: string, increment: number): Promise<number>;
    multi(): import("@redis/client/dist/lib/client/multi-command").RedisClientMultiCommandType<any, any, any>;
    get isOpen(): boolean;
    get isReady(): boolean;
    connect(): Promise<void>;
    quit(): Promise<void>;
    ping(): Promise<string>;
    getJson(key: string): Promise<any>;
    setJson(key: string, value: any, expireInSecs?: number): Promise<void>;
}
export {};
