import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

/**
 * Service for managing blacklisted JWT tokens
 * Uses Redis for storing and checking blacklisted tokens
 */
@Injectable()
export class TokenBlacklistService {
  /**
   * Redis key prefix for blacklisted tokens
   */
  private readonly blacklistKey = 'token_blacklist';

  /**
   * Constructor for TokenBlacklistService
   * @param redisService Redis service for storing and checking blacklisted tokens
   * @param configService Config service for getting JWT expiration time
   */
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Add a token to the blacklist
   * @param token JWT token to blacklist
   * @returns Promise that resolves when token is blacklisted
   */
  async addToken(token: string): Promise<void> {
    /**
     * Get JWT expiration time from config service and convert to seconds
     */
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION');
    const expirationInSeconds = parseInt(jwtExpiration.replace('h', '')) * 3600; // Convert hours to seconds
    await this.redisService.set(`${this.blacklistKey}:${token}`, 'true', { EX: expirationInSeconds });
  }

  /**
   * Check if a token is blacklisted
   * @param token JWT token to check
   * @returns True if token is blacklisted, false otherwise
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisService.get(`${this.blacklistKey}:${token}`);
    return result === 'true';
  }

  /**
   * Clear expired tokens from the blacklist
   */
  async clearExpiredTokens(): Promise<void> {
    const keys = await this.redisService.keys(`${this.blacklistKey}:*`);
    if (keys.length > 0) {
      await this.redisService.del(keys[0]);
    }
  }
}
