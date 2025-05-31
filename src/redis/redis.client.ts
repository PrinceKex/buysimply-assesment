export interface RedisClient {
  get(key: string): Promise<any>;
  set(key: string, value: string, expireInSecs?: number): Promise<void>;
  del(key: string): Promise<number>;
  incr(key: string, incrementBy?: number): Promise<number>;
  decr(key: string, decrementBy?: number): Promise<number>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
  expire(key: string, expireInSecs: number): Promise<number>;
  mget(...keys: string[]): Promise<any[]>;
  mset(keyValues: { [key: string]: any }): Promise<void>;
  mdel(...keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  flushall(): Promise<void>;
  strlen(key: string): Promise<number>;
  type(key: string): Promise<string>;
  rename(oldKey: string, newKey: string): Promise<void>;
  renamenx(oldKey: string, newKey: string): Promise<number>;
}
