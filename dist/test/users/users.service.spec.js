"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const role_entity_1 = require("../../src/users/entities/role.entity");
const user_entity_1 = require("../../src/users/entities/user.entity");
const users_service_1 = require("../../src/users/users.service");
const mockHash = 'hashedpassword';
const mockHashFn = jest.fn().mockResolvedValue(mockHash);
beforeAll(() => {
    jest.mock('bcrypt', () => ({
        hash: mockHashFn
    }));
});
describe('UsersService', () => {
    let service;
    let userRepo;
    let roleRepo;
    const mockUser = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        role_id: '1',
    };
    const mockRole = {
        id: '1',
        name: 'USER',
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                users_service_1.UsersService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn().mockResolvedValue({
                            id: '1',
                            email: 'test@example.com',
                            password_hash: mockHash,
                            first_name: 'Test',
                            last_name: 'User',
                            role_id: '1'
                        }),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        softDelete: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(role_entity_1.Role),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: 'bcrypt',
                    useValue: {
                        hash: mockHashFn
                    }
                }
            ],
        }).compile();
        service = module.get(users_service_1.UsersService);
        userRepo = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        roleRepo = module.get((0, typeorm_1.getRepositoryToken)(role_entity_1.Role));
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        it('should create a new user', async () => {
            roleRepo.findOne.mockResolvedValue(mockRole);
            userRepo.create.mockReturnValue(mockUser);
            userRepo.save.mockResolvedValue(mockUser);
            const result = await service.create({
                email: 'test@example.com',
                password: 'password',
                first_name: 'Test',
                last_name: 'User',
                role_id: '1'
            });
            expect(result).toEqual(mockUser);
        });
    });
    describe('findAll', () => {
        it('should return all users', async () => {
            userRepo.find.mockResolvedValue([mockUser]);
            const result = await service.findAll();
            expect(result).toEqual([mockUser]);
        });
    });
    describe('findOne', () => {
        it('should return a user', async () => {
            userRepo.findOne.mockResolvedValue(mockUser);
            const result = await service.findOne('1');
            expect(result).toEqual(mockUser);
        });
        it('should throw NotFoundException if user not found', async () => {
            userRepo.findOne.mockResolvedValue(null);
            await expect(service.findOne('1')).rejects.toThrow('User with ID 1 not found');
        });
    });
    describe('update', () => {
        it('should update a user', async () => {
            const updatedUser = Object.assign(Object.assign({}, mockUser), { first_name: 'Updated' });
            userRepo.findOne.mockResolvedValue(mockUser);
            userRepo.save.mockResolvedValue(updatedUser);
            const result = await service.update('1', { first_name: 'Updated' });
            expect(result).toEqual(updatedUser);
        });
    });
    describe('remove', () => {
        it('should remove a user', async () => {
            userRepo.findOne.mockResolvedValue(mockUser);
            userRepo.softDelete.mockResolvedValue({ affected: 1 });
            await service.remove('1');
            expect(userRepo.softDelete).toHaveBeenCalledWith({ id: '1' });
        });
    });
    describe('findByEmail', () => {
        it('should find user by email', async () => {
            userRepo.findOne.mockResolvedValue(mockUser);
            const result = await service.findByEmail('test@example.com');
            expect(result).toEqual(mockUser);
        });
        it('should return null if user not found', async () => {
            userRepo.findOne.mockResolvedValue(null);
            const result = await service.findByEmail('notfound@example.com');
            expect(result).toBeNull();
        });
    });
    describe('password validation', () => {
        it('should hash password during create', async () => {
            const result = await service.create({
                email: 'test@example.com',
                password: 'password',
                first_name: 'Test',
                last_name: 'User',
                role_id: '1'
            });
            expect(mockHashFn).toHaveBeenCalledWith('password', 10);
            expect(result.password_hash).toBe(mockHash);
        });
    });
});
//# sourceMappingURL=users.service.spec.js.map