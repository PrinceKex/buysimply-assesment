/**
 * Unit tests for TasksService
 * Tests task management business logic including:
 * - Task creation and updates
 * - Task status transitions
 * - Priority management
 * - Soft deletion
 * - User-task relationships
 */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskPriority, TaskStatus } from 'src/common/constants/task.constants';
import { UserDto } from 'src/common/types/user.type';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from 'src/tasks/dto/update-task.dto';
import { Task } from 'src/tasks/entities/task.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { User } from 'src/users/entities/user.entity';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: any;
  let userRepo: any;
  let mockTaskEntity: Task;

  beforeEach(async () => {
    // Create fresh repository mocks for each test
    taskRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      softDelete: jest.fn()
    };

    userRepo = {
      findOne: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: taskRepo
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo
        }
      ]
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  const UserMock = class UserMock {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role_id: string;
    role: { 
      id: string; 
      code: string;
      name: string;
      description: string;
      users: User[];
      created_at: Date;
      updated_at: Date;
    };
    role_code: string; // Add role_code property
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    tasks: [];

    toDto(): UserDto {
      return {
        id: this.id,
        email: this.email,
        first_name: this.first_name,
        last_name: this.last_name,
        role_id: this.role_id,
        role_code: this.role.code,
        is_active: this.is_active,
        created_at: this.created_at,
        updated_at: this.updated_at,
        deleted_at: this.deleted_at
      };
    }
  };

  const updateTask: UpdateTaskDto = {
    title: 'Updated Task',
    description: 'Updated description',
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
  };

  const mockUser = new UserMock();
  Object.assign(mockUser, {
    id: '1',
    email: 'test@example.com',
    role_code: 'user', // Add role_code
    password_hash: 'hashed_password',
    first_name: 'Test',
    last_name: 'User',
    role_id: '1',
    role: {
      id: '1',
      code: 'USER',
      name: 'User',
      description: 'Regular user role',
      users: [],
      created_at: new Date(),
      updated_at: new Date()
    },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    tasks: []
  }) as User;

  const otherUser = new UserMock();
  Object.assign(otherUser, mockUser);
  otherUser.id = '2';

  const mockTask: CreateTaskDto = {
    title: 'Test Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            softDelete: jest.fn(),
            update: jest.fn(),
            queryBuilder: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepo = module.get(getRepositoryToken(Task));
    userRepo = module.get(getRepositoryToken(User));

    // Initialize mock task entity
    mockTaskEntity = {
      id: '1',
      title: 'Test Task',
      description: 'Test task description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      due_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      user: mockUser,
      toDto: () => ({
        id: '1',
        title: 'Test Task',
        description: 'Test task description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        due_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        user_id: '1',
        user: mockUser.toDto(),
      })
    } as Task;

    // Mock repository methods
    taskRepo.create.mockReturnValue(mockTaskEntity);
    taskRepo.save.mockReturnValue(mockTaskEntity);
    taskRepo.findOne.mockReturnValue(mockTaskEntity);
    taskRepo.find.mockReturnValue(Promise.resolve([mockTaskEntity]));
    taskRepo.delete.mockReturnValue(Promise.resolve({ affected: 1 }));
    taskRepo.softDelete.mockReturnValue(Promise.resolve({ affected: 1 }));
    taskRepo.update.mockReturnValue(Promise.resolve({ affected: 1 }));

    // Mock findById method
    service['findById'] = jest.fn().mockResolvedValue(mockTaskEntity);

    // Mock findAll method
    service['findAll'] = jest.fn().mockResolvedValue({
      data: [],
      total: 0
    });

  });

  describe('create', () => {
    it('should create a new task', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      taskRepo.create.mockReturnValue(mockTaskEntity);
      taskRepo.save.mockResolvedValue(mockTaskEntity);

      const result = await service.create(mockTask, '1');
      expect(result).toEqual(mockTaskEntity);
    });
    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.create(mockTask, '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTask: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      };
    
      taskRepo.findOne.mockResolvedValue({
        ...mockTaskEntity,
        user: mockUser
      });
      taskRepo.save.mockResolvedValue({
        ...mockTaskEntity,
        ...updateTask
      });

      const result = await service.update('1', updateTask, mockUser);
      expect(result).toEqual({
        ...mockTaskEntity,
        ...updateTask
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      // Mock the repository to return null
      taskRepo.findOne.mockResolvedValue(null);
      
      // Mock findById to return null
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(service.update('1', updateTask, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a task', async () => {
      // Mock the user ID check
      taskRepo.findOne.mockResolvedValue({
        ...mockTaskEntity,
        user: mockUser
      });

      taskRepo.softDelete.mockResolvedValue({ affected: 1 });
      await service.remove('1', mockUser);
      expect(taskRepo.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if task not found', async () => {
      // Mock the repository to return null
      taskRepo.findOne.mockResolvedValue(null);
      
      // Mock findById to return null
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(service.remove('1', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      // Mock the repository methods
      taskRepo.findAndCount.mockResolvedValue([
        [
          {
            id: '1',
            title: 'Test Task',
            description: 'Test task description',
            status: TaskStatus.PENDING,
            priority: TaskPriority.MEDIUM,
            due_date: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            user: mockUser
          }
        ],
        1
      ]);

      // Mock user repository to return the mock user
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findAll();
      expect(result).toEqual({
        data: [
          {
            id: '1',
            title: 'Test Task',
            description: 'Test task description',
            status: TaskStatus.PENDING,
            priority: TaskPriority.MEDIUM,
            due_date: expect.any(Date),
            created_at: expect.any(Date),
            updated_at: expect.any(Date),
            deleted_at: null,
            user: mockUser
          }
        ],
        total: 1
      });
    });
  });
});  

  
