/**
 * Unit tests for AuthService
 * Tests authentication-related business logic including:
 * - User registration
 * - Login with rate limiting
 * - Token generation and validation
 * - Password hashing and verification
 */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RateLimiterRedis } from 'rate-limiter-flexible';

import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { TokenBlacklistService } from 'src/auth/token-blacklist.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Redis } from 'ioredis';
import { RedisClient } from '../../src/redis/redis.client'; // Keep this for type definitions
import { Inject } from '@nestjs/common';
//   port: 6379,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   }
// });

// Fake in-memory Redis mock
const redis = {
  store: {},
  get: jest.fn(async (key) => redis.store[key] || null),
  set: jest.fn(async (key, value) => { redis.store[key] = value; }),
  del: jest.fn(async (key) => { delete redis.store[key]; }),
  flushall: jest.fn(async () => { redis.store = {}; }),
};

// Mock RedisService to use the real Redis connection
// jest.mock('src/redis/redis.service', () => {
//   return {
//     static: {
//       client: redis,
//       getClient: () => redis
//     },
//     getClient: () => redis,
//     onModuleInit: () => Promise.resolve(),
//     onModuleDestroy: () => Promise.resolve(),
//     get: async (key: string) => {
//       const value = await redis.get(key);
//       return value ? JSON.parse(value) : null;
//     },
//     set: async (key: string, value: any) => {
//       await redis.set(key, JSON.stringify(value));
//     }
//   };
// });

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));

// Create a dynamic mock for RateLimiterRedis
const mockRateLimiter = {
  consume: jest.fn().mockImplementation(async (key: string) => ({
    points: 1,
    remainingPoints: 4,
    consumedPoints: 1,
    remainingMs: 59000,
    msBeforeNext: 0
  })),
  getPoints: jest.fn().mockResolvedValue({ points: 5, remainingPoints: 5 }),
  getDuration: jest.fn().mockResolvedValue(60000),
  getBlockDuration: jest.fn().mockResolvedValue(300000),
  delete: jest.fn().mockResolvedValue(true)
};

// Use Jest's dynamic mock
jest.mock('rate-limiter-flexible', () => ({
  RateLimiterRedis: jest.fn(() => ({
    consume: mockRateLimiter.consume,
    getPoints: mockRateLimiter.getPoints,
    getDuration: mockRateLimiter.getDuration,
    getBlockDuration: mockRateLimiter.getBlockDuration,
    delete: mockRateLimiter.delete
  }))
}));

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;
  let rateLimiter: RateLimiterRedis;
  let tokenBlacklistService: TokenBlacklistService;
  let mockUser: User;
  let mockJwtService: Partial<JwtService>;
  let mockUsersService: Partial<UsersService>;
  let mockTokenBlacklistService: Partial<TokenBlacklistService>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Initialize mocks
    mockUser = {
      id: '1',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      first_name: 'Test',
      last_name: 'User',
      role_id: '1'
    } as User;

    // Initialize mock services
    mockUsersService = {
      findByEmail: jest.fn(),
      findOne: jest.fn(),
      findOneOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn()
    } as Partial<UsersService> & { findOneOrThrow: jest.Mock };   

    mockTokenBlacklistService = {
      addToken: jest.fn().mockReturnValue(Promise.resolve()),
      isTokenBlacklisted: jest.fn().mockReturnValue(Promise.resolve(false)),
      clearExpiredTokens: jest.fn().mockReturnValue(Promise.resolve())
    } as Partial<TokenBlacklistService>;

    

    mockJwtService = {
      sign: jest.fn().mockReturnValue('token'),
      verify: jest.fn()
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case 'JWT_SECRET':
            return 'test-secret';
          case 'JWT_EXPIRES_IN':
            return '1d';
          default:
            return null;
        }
      })
    };

    // Initialize rate limiter
    // Initialize rate limiter with in-memory Redis mock
    rateLimiter = new RateLimiterRedis({
      storeClient: {
        get: redis.get,
        set: redis.set,
        del: redis.del
      },
      points: 5,
      duration: 60,
      blockDuration: 300
    });

    // Create testing module
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            addToken: mockTokenBlacklistService.addToken,
            isTokenBlacklisted: mockTokenBlacklistService.isTokenBlacklisted,
            clearExpiredTokens: mockTokenBlacklistService.clearExpiredTokens
          }
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            get: redis.get,
            set: redis.set,
            del: redis.del,
            flushall: redis.flushall
          }
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUsersService = module.get<UsersService>(UsersService);
    mockJwtService = module.get<JwtService>(JwtService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
    // Remove rate limiter from module.get since we're initializing it directly
    
    // Initialize rate limiter with in-memory Redis client (already initialized above)
  });

  afterEach(async () => {
    // Clear Redis data after each test
    await redis.flushall();
    jest.clearAllMocks();
  });

  // Remove afterAll since we're using in-memory Redis mock
   

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if valid credentials', async () => {
      // Mock rate limiter to allow login
      mockRateLimiter.consume.mockResolvedValue({
        consumedPoints: 1,
        remainingPoints: 4,
        points: 5,
        duration: 60,
        blockDuration: 300
      });
      mockRateLimiter.delete.mockResolvedValue(true);

      // Mock user service
      mockUsersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
      expect(mockRateLimiter.consume).toHaveBeenCalledWith('login_attempts:test@example.com');
      expect(mockRateLimiter.delete).toHaveBeenCalledWith('login_attempts:test@example.com');
    });

    it('should throw error if rate limit exceeded', async () => {
      // Mock rate limiter to block login
      mockRateLimiter.consume.mockRejectedValueOnce({
        name: 'RateLimiterError',
        msBeforeNext: 60000,
        points: 0,
        remainingPoints: 0,
        consumedPoints: 5,
        action: 'block'
      });
      mockRateLimiter.delete.mockResolvedValue(true);

      await expect(service.validateUser('test@example.com', 'password'))
        .rejects.toThrow('Too many login attempts. Please wait 60 seconds before trying again.');
      expect(mockRateLimiter.consume).toHaveBeenCalledWith('login_attempts:test@example.com');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Mock rate limiter to allow login
      mockRateLimiter.consume.mockResolvedValue({
        consumedPoints: 1,
        remainingPoints: 4,
        points: 5,
        duration: 60,
        blockDuration: 300
      });
      mockRateLimiter.delete.mockResolvedValue(true);

      // Mock user service to return null
      mockUsersService.findByEmail = jest.fn().mockResolvedValue(null);

      await expect(service.validateUser('test@example.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
      expect(mockRateLimiter.consume).toHaveBeenCalledWith('login_attempts:test@example.com');
    });

    it('should throw error if password comparison fails', async () => {
      // Mock rate limiter to allow login
      mockRateLimiter.consume.mockResolvedValue({
        consumedPoints: 1,
        remainingPoints: 4,
        points: 5,
        duration: 60,
        blockDuration: 300
      });
      mockRateLimiter.delete.mockResolvedValue(true);

      // Mock user service
      mockUsersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'password'))
        .rejects.toThrow('Invalid credentials');
      expect(mockRateLimiter.consume).toHaveBeenCalledWith('login_attempts:test@example.com');
    });

  });

  describe('login', () => {
    it('should return JWT token and user data on successful login', async () => {
      // Mock findByEmail to return user
      mockUsersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      // Mock bcrypt compare
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      // Mock JWT token generation
      mockJwtService.sign = jest.fn().mockReturnValue('token');

      // Mock rate limiter
      rateLimiter.consume = jest.fn().mockResolvedValue({
        consumedPoints: 1,
        remainingPoints: 4,
        points: 5,
        duration: 60,
        blockDuration: 300
      });
      rateLimiter.delete = jest.fn();

      // Then call login with the validated user
      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: 'token',
        user: {
          id: '1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role_code: null,
          created_at: undefined,
          updated_at: undefined,
          deleted_at: undefined,
          is_active: undefined
        }
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Mock findByEmail to return user
      mockUsersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      // Mock bcrypt compare to return false
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.login(mockUser)).rejects.toThrow(UnauthorizedException);
      expect(rateLimiter.consume).toHaveBeenCalledWith('login_attempts:test@example.com');
    });
  });
});
