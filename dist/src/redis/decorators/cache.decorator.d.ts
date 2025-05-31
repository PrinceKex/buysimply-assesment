import { CacheOptions } from '../cache.options';
export declare function Cache(options: CacheOptions): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
