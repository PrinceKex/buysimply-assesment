export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  skipCache?: boolean;
  key?: string; // Custom cache key
}
