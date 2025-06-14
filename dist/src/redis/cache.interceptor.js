"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const redis_service_1 = require("./redis.service");
let CacheInterceptor = class CacheInterceptor {
    constructor(redisService) {
        this.redisService = redisService;
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const options = context.getHandler().name === 'get' ? { ttl: 3600 } : { skipCache: true };
        const key = this.generateCacheKey(request, options);
        if (options.skipCache) {
            return next.handle();
        }
        const cachedData = await this.redisService.get(key);
        if (cachedData !== null) {
            const parsedData = JSON.parse(cachedData);
            return new rxjs_1.Observable((observer) => {
                observer.next(parsedData);
                observer.complete();
            });
        }
        return next.handle().pipe((0, operators_1.map)((data) => {
            if (options.ttl) {
                this.redisService.set(key, JSON.stringify(data), { EX: options.ttl });
            }
            else {
                this.redisService.set(key, JSON.stringify(data));
            }
            return data;
        }));
    }
    generateCacheKey(request, options) {
        const { method, url, query } = request;
        const customKey = options.key || `${method}:${url}`;
        if (Object.keys(query).length > 0) {
            return `${customKey}:${JSON.stringify(query)}`;
        }
        return customKey;
    }
};
exports.CacheInterceptor = CacheInterceptor;
exports.CacheInterceptor = CacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], CacheInterceptor);
//# sourceMappingURL=cache.interceptor.js.map