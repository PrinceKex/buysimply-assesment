"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const testing_1 = require("@nestjs/testing");
const bcrypt = __importStar(require("bcrypt"));
const auth_service_1 = require("../../src/auth/auth.service");
const token_blacklist_service_1 = require("../../src/auth/token-blacklist.service");
const users_service_1 = require("../../src/users/users.service");
const redis = {
    store: {},
    get: jest.fn(async (key) => redis.store[key] || null),
    set: jest.fn(async (key, value) => { redis.store[key] = value; }),
    del: jest.fn(async (key) => { delete redis.store[key]; }),
    flushall: jest.fn(async () => { redis.store = {}; }),
};
jest.mock('bcrypt', () => ({
    compare: jest.fn()
}));
const mockRateLimiter = {
    consume: jest.fn().mockImplementation(async (key) => ({
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
    let service;
    let module;
    let rateLimiter;
    let tokenBlacklistService;
    let mockUser;
    let mockJwtService;
    let mockUsersService;
    let mockTokenBlacklistService;
    let mockConfigService;
    beforeEach(async () => {
        jest.clearAllMocks();
        mockUser = {
            id: '1',
            email: 'test@example.com',
            password_hash: 'hashed_password',
            first_name: 'Test',
            last_name: 'User',
            role_id: '1'
        };
        mockUsersService = {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            findOneOrThrow: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn()
        };
        mockTokenBlacklistService = {
            addToken: jest.fn().mockReturnValue(Promise.resolve()),
            isTokenBlacklisted: jest.fn().mockReturnValue(Promise.resolve(false)),
            clearExpiredTokens: jest.fn().mockReturnValue(Promise.resolve())
        };
        mockJwtService = {
            sign: jest.fn().mockReturnValue('token'),
            verify: jest.fn()
        };
        mockConfigService = {
            get: jest.fn().mockImplementation((key) => {
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
        rateLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: {
                get: redis.get,
                set: redis.set,
                del: redis.del
            },
            points: 5,
            duration: 60,
            blockDuration: 300
        });
        module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: users_service_1.UsersService,
                    useValue: mockUsersService
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService
                },
                {
                    provide: token_blacklist_service_1.TokenBlacklistService,
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
                    provide: config_1.ConfigService,
                    useValue: mockConfigService
                }
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        mockUsersService = module.get(users_service_1.UsersService);
        mockJwtService = module.get(jwt_1.JwtService);
        tokenBlacklistService = module.get(token_blacklist_service_1.TokenBlacklistService);
    });
    afterEach(async () => {
        await redis.flushall();
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('validateUser', () => {
        it('should return user if valid credentials', async () => {
            mockRateLimiter.consume.mockResolvedValue({
                consumedPoints: 1,
                remainingPoints: 4,
                points: 5,
                duration: 60,
                blockDuration: 300
            });
            mockRateLimiter.delete.mockResolvedValue(true);
            mockUsersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            const result = await service.validateUser('test@example.com', 'password');
            expect(result).toEqual(mockUser);
            expect(mockRateLimiter.consume).toHaveBeenCalledWith('login_attempts:test@example.com');
            expect(mockRateLimiter.delete).toHaveBeenCalledWith('login_attempts:test@example.com');
        });
        it('should throw error if rate limit exceeded', async () => {
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
            mockRateLimiter.consume.mockResolvedValue({
                consumedPoints: 1,
                remainingPoints: 4,
                points: 5,
                duration: 60,
                blockDuration: 300
            });
            mockRateLimiter.delete.mockResolvedValue(true);
            mockUsersService.findByEmail = jest.fn().mockResolvedValue(null);
            await expect(service.validateUser('test@example.com', 'password'))
                .rejects.toThrow(common_1.UnauthorizedException);
            expect(mockRateLimiter.consume).toHaveBeenCalledWith('login_attempts:test@example.com');
        });
        it('should throw error if password comparison fails', async () => {
            mockRateLimiter.consume.mockResolvedValue({
                consumedPoints: 1,
                remainingPoints: 4,
                points: 5,
                duration: 60,
                blockDuration: 300
            });
            mockRateLimiter.delete.mockResolvedValue(true);
            mockUsersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
            await expect(service.validateUser('test@example.com', 'password'))
                .rejects.toThrow('Invalid credentials');
            expect(mockRateLimiter.consume).toHaveBeenCalledWith('login_attempts:test@example.com');
        });
    });
    describe('login', () => {
        it('should return JWT token and user data on successful login', async () => {
            mockUsersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            mockJwtService.sign = jest.fn().mockReturnValue('token');
            rateLimiter.consume = jest.fn().mockResolvedValue({
                consumedPoints: 1,
                remainingPoints: 4,
                points: 5,
                duration: 60,
                blockDuration: 300
            });
            rateLimiter.delete = jest.fn();
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
            mockUsersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
            await expect(service.login(mockUser)).rejects.toThrow(common_1.UnauthorizedException);
            expect(rateLimiter.consume).toHaveBeenCalledWith('login_attempts:test@example.com');
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map