/**
 * Unit tests for UsersService
 * Tests user management business logic including:
 * - User creation and updates
 * - Role management
 * - Password hashing
 * - User queries and relationships
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/users/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

// Mock bcrypt globally before any tests run
/** Mock hash value for password hashing */
const mockHash = 'hashedpassword';
const mockHashFn = jest.fn().mockResolvedValue(mockHash);

/** Set up bcrypt mock before all tests */
beforeAll(() => {
  jest.mock('bcrypt', () => ({
    hash: mockHashFn
  }));
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: any;
  let roleRepo: any;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
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
          provide: getRepositoryToken(Role),
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

    // No need to get bcrypt from the module since we've already set it up in the providers

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    roleRepo = module.get(getRepositoryToken(Role));
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
      const updatedUser = { ...mockUser, first_name: 'Updated' };
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
  })

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
