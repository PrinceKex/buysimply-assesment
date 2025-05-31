import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
export declare class TokenBlacklistService {
    private readonly redisService;
    private readonly configService;
    private readonly blacklistKey;
    constructor(redisService: RedisService, configService: ConfigService);
    addToken(token: string): Promise<void>;
    isTokenBlacklisted(token: string): Promise<boolean>;
    clearExpiredTokens(): Promise<void>;
}
