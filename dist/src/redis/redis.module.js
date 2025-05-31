"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("./redis.service");
let RedisModule = RedisModule_1 = class RedisModule {
    static forRoot(options) {
        return {
            module: RedisModule_1,
            imports: [config_1.ConfigModule],
            providers: [
                {
                    provide: 'REDIS_OPTIONS',
                    useFactory: (configService) => ({
                        host: (options === null || options === void 0 ? void 0 : options.host) || configService.get('REDIS_HOST', 'localhost'),
                        port: (options === null || options === void 0 ? void 0 : options.port) || configService.get('REDIS_PORT', 6379),
                        retryStrategy: (options === null || options === void 0 ? void 0 : options.retryStrategy) || ((retries) => {
                            if (retries > 5) {
                                return new Error('Max reconnection attempts reached');
                            }
                            return Math.min(retries * 100, 2000);
                        })
                    }),
                    inject: [config_1.ConfigService]
                },
                redis_service_1.RedisService
            ],
            exports: [redis_service_1.RedisService]
        };
    }
    static forRootAsync(options) {
        return {
            module: RedisModule_1,
            imports: [...(options.imports || []), config_1.ConfigModule],
            providers: [
                {
                    provide: 'REDIS_OPTIONS',
                    useFactory: async (...args) => {
                        const config = await options.useFactory(...args);
                        const configService = args[args.length - 1];
                        return {
                            host: config.host || configService.get('REDIS_HOST', 'localhost'),
                            port: config.port || configService.get('REDIS_PORT', 6379),
                            retryStrategy: config.retryStrategy || ((retries) => {
                                if (retries > 5) {
                                    return new Error('Max reconnection attempts reached');
                                }
                                return Math.min(retries * 100, 2000);
                            })
                        };
                    },
                    inject: [...(options.inject || []), config_1.ConfigService]
                },
                redis_service_1.RedisService
            ],
            exports: [redis_service_1.RedisService]
        };
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = RedisModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [redis_service_1.RedisService],
        exports: [redis_service_1.RedisService]
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map