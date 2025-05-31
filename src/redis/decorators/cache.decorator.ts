import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '../cache.interceptor';
import { CacheOptions } from '../cache.options';

export function Cache(options: CacheOptions) {
  return applyDecorators(
    UseInterceptors(CacheInterceptor)
  );
}
