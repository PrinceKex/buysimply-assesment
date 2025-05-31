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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
let RedisService = class RedisService {
    constructor(options) {
        this.options = options;
        this.isInitialized = false;
        this.connectionPromise = null;
        if (!options.host || !options.port) {
            throw new Error('Redis configuration is missing required host and port');
        }
    }
    async onModuleInit() {
        await this.initialize();
    }
    async onModuleDestroy() {
        await this.quit();
    }
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        this.connectionPromise = (async () => {
            try {
                this.client = (0, redis_1.createClient)({
                    url: `redis://${this.options.host}:${this.options.port}`,
                    socket: {
                        connectTimeout: 10000,
                        reconnectStrategy: (retries) => {
                            if (retries > 5) {
                                console.error('Max reconnection attempts reached');
                                return new Error('Max reconnection attempts reached');
                            }
                            return Math.min(retries * 100, 2000);
                        }
                    }
                });
                this.client.on('error', (err) => {
                    console.error('Redis Client Error:', err);
                });
                this.client.on('connect', () => {
                    console.log('Redis client connected');
                });
                this.client.on('ready', () => {
                    console.log('Redis client ready');
                    this.isInitialized = true;
                });
                this.client.on('reconnecting', () => {
                    console.log('Redis client reconnecting...');
                });
                this.client.on('end', () => {
                    console.log('Redis client disconnected');
                    this.isInitialized = false;
                });
                await this.client.connect();
            }
            catch (err) {
                console.error('Failed to connect to Redis:', err);
                throw err;
            }
            finally {
                this.connectionPromise = null;
            }
        })();
        return this.connectionPromise;
    }
    async ensureConnected() {
        var _a;
        if (!this.isInitialized || !((_a = this.client) === null || _a === void 0 ? void 0 : _a.isReady)) {
            await this.initialize();
        }
        try {
            await this.client.ping();
        }
        catch (err) {
            console.error('Redis ping failed, reinitializing connection...');
            this.isInitialized = false;
            await this.initialize();
        }
    }
    getClient() {
        if (!this.client) {
            throw new Error('Redis client not initialized');
        }
        return this.client;
    }
    async get(key) {
        await this.ensureConnected();
        return this.client.get(key);
    }
    async set(key, value, options) {
        await this.ensureConnected();
        if (options === null || options === void 0 ? void 0 : options.EX) {
            return this.client.set(key, value, { EX: options.EX });
        }
        return this.client.set(key, value);
    }
    async del(key) {
        await this.ensureConnected();
        return this.client.del(key);
    }
    async exists(key) {
        await this.ensureConnected();
        return this.client.exists(key);
    }
    async expire(key, seconds) {
        await this.ensureConnected();
        return this.client.expire(key, seconds);
    }
    async keys(pattern) {
        await this.ensureConnected();
        return this.client.keys(pattern);
    }
    async ttl(key) {
        await this.ensureConnected();
        return this.client.ttl(key);
    }
    async incr(key) {
        await this.ensureConnected();
        return this.client.incr(key);
    }
    async incrBy(key, increment) {
        await this.ensureConnected();
        return this.client.incrBy(key, increment);
    }
    multi() {
        if (!this.client) {
            throw new Error('Redis client not initialized');
        }
        return this.client.multi();
    }
    get isOpen() {
        var _a;
        return ((_a = this.client) === null || _a === void 0 ? void 0 : _a.isOpen) || false;
    }
    get isReady() {
        var _a;
        return ((_a = this.client) === null || _a === void 0 ? void 0 : _a.isReady) || false;
    }
    async connect() {
        await this.ensureConnected();
    }
    async quit() {
        if (this.client) {
            await this.client.quit();
            this.isInitialized = false;
        }
    }
    async ping() {
        await this.ensureConnected();
        return this.client.ping();
    }
    async getJson(key) {
        const value = await this.get(key);
        return value ? JSON.parse(value) : null;
    }
    async setJson(key, value, expireInSecs) {
        const options = expireInSecs ? { EX: expireInSecs } : undefined;
        await this.set(key, JSON.stringify(value), options);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_OPTIONS')),
    __metadata("design:paramtypes", [Object])
], RedisService);
//# sourceMappingURL=redis.service.js.map