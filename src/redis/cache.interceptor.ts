import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RedisService } from './redis.service';
import { CacheOptions } from './cache.options';
import { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const options = context.getHandler().name === 'get' ? { ttl: 3600 } : { skipCache: true };
    const key = this.generateCacheKey(request, options);

    // Check if caching should be skipped
    if (options.skipCache) {
      return next.handle();
    }

    // Try to get from cache
    const cachedData = await this.redisService.get(key);

    if (cachedData !== null) {
      const parsedData = JSON.parse(cachedData);
      return new Observable((observer) => {
        observer.next(parsedData);
        observer.complete();
      });
    }

    // If not in cache, proceed with the request
    return next.handle().pipe(
      map((data) => {
        // Cache the response
        if (options.ttl) {
          this.redisService.set(key, JSON.stringify(data), { EX: options.ttl });
        } else {
          this.redisService.set(key, JSON.stringify(data));
        }
        return data;
      })
    );
  }

  private generateCacheKey(request: Request, options: CacheOptions): string {
    const { method, url, query } = request;
    const customKey = options.key || `${method}:${url}`;
    
    // Include query parameters in the cache key if they exist
    if (Object.keys(query).length > 0) {
      return `${customKey}:${JSON.stringify(query)}`;
    }
    
    return customKey;
  }
}
