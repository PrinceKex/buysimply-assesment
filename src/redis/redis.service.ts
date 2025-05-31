import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType as BaseRedisClientType } from 'redis';
import { RedisModuleOptions } from './redis.module';

type RedisClient = BaseRedisClientType<any, any, any>;

/**
 * Interface for Redis client operations
 */
export interface RedisClientType {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { EX?: number }) => Promise<string | null>;
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

/**
 * Redis service implementing RedisClient interface
 * Service for Redis operations
 * Handles connection management and provides Redis client methods
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy, RedisClientType {
  private client: RedisClient;
  private isInitialized = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(
    @Inject('REDIS_OPTIONS') private readonly options: RedisModuleOptions
  ) {
    if (!options.host || !options.port) {
      throw new Error('Redis configuration is missing required host and port');
    }
  }

  async onModuleInit() {
    await this.initialize();
  }

  async onModuleDestroy() {
    await this.quit();
  }

  private async initialize() {
    if (this.isInitialized) {
      return;
    }
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      try {
        this.client = createClient({
          url: `redis://${this.options.host}:${this.options.port}`,
          socket: {
            connectTimeout: 10000,
            reconnectStrategy: (retries: number) => {
              if (retries > 5) {
                console.error('Max reconnection attempts reached');
                return new Error('Max reconnection attempts reached');
              }
              return Math.min(retries * 100, 2000);
            }
          }
        });

        this.client.on('error', (err: Error) => {
          console.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
          console.log('Redis client connected');
        });

        this.client.on('ready', () => {
          console.log('Redis client ready');
          this.isInitialized = true;
        });

        this.client.on('reconnecting', () => {
          console.log('Redis client reconnecting...');
        });

        this.client.on('end', () => {
          console.log('Redis client disconnected');
          this.isInitialized = false;
        });

        await this.client.connect();
      } catch (err) {
        console.error('Failed to connect to Redis:', err);
        throw err;
      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  async ensureConnected() {
    if (!this.isInitialized || !this.client?.isReady) {
      await this.initialize();
    }
    // Ping to verify connection
    try {
      await this.client.ping();
    } catch (err) {
      console.error('Redis ping failed, reinitializing connection...');
      this.isInitialized = false;
      await this.initialize();
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    await this.ensureConnected();
    return this.client.get(key);
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<string | null> {
    await this.ensureConnected();
    if (options?.EX) {
      return this.client.set(key, value, { EX: options.EX });
    }
    return this.client.set(key, value);
  }

  async del(key: string | string[]): Promise<number> {
    await this.ensureConnected();
    return this.client.del(key);
  }

  async exists(key: string | string[]): Promise<number> {
    await this.ensureConnected();
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    await this.ensureConnected();
    return this.client.expire(key, seconds);
  }

  async keys(pattern: string): Promise<string[]> {
    await this.ensureConnected();
    return this.client.keys(pattern);
  }

  async ttl(key: string): Promise<number> {
    await this.ensureConnected();
    return this.client.ttl(key);
  }

  async incr(key: string): Promise<number> {
    await this.ensureConnected();
    return this.client.incr(key);
  }

  async incrBy(key: string, increment: number): Promise<number> {
    await this.ensureConnected();
    return this.client.incrBy(key, increment);
  }

  multi() {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    return this.client.multi();
  }

  get isOpen(): boolean {
    return this.client?.isOpen || false;
  }

  get isReady(): boolean {
    return this.client?.isReady || false;
  }

  async connect(): Promise<void> {
    await this.ensureConnected();
  }

  async quit(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isInitialized = false;
    }
  }

  async ping(): Promise<string> {
    await this.ensureConnected();
    return this.client.ping();
  }

  // Helper methods for our application
  async getJson(key: string): Promise<any> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setJson(key: string, value: any, expireInSecs?: number): Promise<void> {
    const options = expireInSecs ? { EX: expireInSecs } : undefined;
    await this.set(key, JSON.stringify(value), options);
  }
}
