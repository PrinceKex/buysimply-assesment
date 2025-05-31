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
exports.TokenBlacklistService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const config_1 = require("@nestjs/config");
let TokenBlacklistService = class TokenBlacklistService {
    constructor(redisService, configService) {
        this.redisService = redisService;
        this.configService = configService;
        this.blacklistKey = 'token_blacklist';
    }
    async addToken(token) {
        const jwtExpiration = this.configService.get('JWT_EXPIRATION');
        const expirationInSeconds = parseInt(jwtExpiration.replace('h', '')) * 3600;
        await this.redisService.set(`${this.blacklistKey}:${token}`, 'true', { EX: expirationInSeconds });
    }
    async isTokenBlacklisted(token) {
        const result = await this.redisService.get(`${this.blacklistKey}:${token}`);
        return result === 'true';
    }
    async clearExpiredTokens() {
        const keys = await this.redisService.keys(`${this.blacklistKey}:*`);
        if (keys.length > 0) {
            await this.redisService.del(keys[0]);
        }
    }
};
exports.TokenBlacklistService = TokenBlacklistService;
exports.TokenBlacklistService = TokenBlacklistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService])
], TokenBlacklistService);
//# sourceMappingURL=token-blacklist.service.js.map