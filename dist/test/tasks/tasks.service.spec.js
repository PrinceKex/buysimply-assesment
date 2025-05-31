"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const task_constants_1 = require("../../src/common/constants/task.constants");
const task_entity_1 = require("../../src/tasks/entities/task.entity");
const tasks_service_1 = require("../../src/tasks/tasks.service");
const user_entity_1 = require("../../src/users/entities/user.entity");
describe('TasksService', () => {
    let service;
    let taskRepo;
    let userRepo;
    let mockTaskEntity;
    beforeEach(async () => {
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                tasks_service_1.TasksService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(task_entity_1.Task),
                    useValue: taskRepo
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: userRepo
                }
            ]
        }).compile();
        service = module.get(tasks_service_1.TasksService);
    });
    const UserMock = class UserMock {
        toDto() {
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
    const updateTask = {
        title: 'Updated Task',
        description: 'Updated description',
        priority: task_constants_1.TaskPriority.HIGH,
        status: task_constants_1.TaskStatus.IN_PROGRESS,
    };
    const mockUser = new UserMock();
    Object.assign(mockUser, {
        id: '1',
        email: 'test@example.com',
        role_code: 'user',
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
    });
    const otherUser = new UserMock();
    Object.assign(otherUser, mockUser);
    otherUser.id = '2';
    const mockTask = {
        title: 'Test Task',
        status: task_constants_1.TaskStatus.PENDING,
        priority: task_constants_1.TaskPriority.MEDIUM,
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                tasks_service_1.TasksService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(task_entity_1.Task),
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
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: {
                        findOne: jest.fn()
                    }
                }
            ]
        }).compile();
        service = module.get(tasks_service_1.TasksService);
        taskRepo = module.get((0, typeorm_1.getRepositoryToken)(task_entity_1.Task));
        userRepo = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        mockTaskEntity = {
            id: '1',
            title: 'Test Task',
            description: 'Test task description',
            status: task_constants_1.TaskStatus.PENDING,
            priority: task_constants_1.TaskPriority.MEDIUM,
            due_date: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            user: mockUser,
            toDto: () => ({
                id: '1',
                title: 'Test Task',
                description: 'Test task description',
                status: task_constants_1.TaskStatus.PENDING,
                priority: task_constants_1.TaskPriority.MEDIUM,
                due_date: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
                user_id: '1',
                user: mockUser.toDto(),
            })
        };
        taskRepo.create.mockReturnValue(mockTaskEntity);
        taskRepo.save.mockReturnValue(mockTaskEntity);
        taskRepo.findOne.mockReturnValue(mockTaskEntity);
        taskRepo.find.mockReturnValue(Promise.resolve([mockTaskEntity]));
        taskRepo.delete.mockReturnValue(Promise.resolve({ affected: 1 }));
        taskRepo.softDelete.mockReturnValue(Promise.resolve({ affected: 1 }));
        taskRepo.update.mockReturnValue(Promise.resolve({ affected: 1 }));
        service['findById'] = jest.fn().mockResolvedValue(mockTaskEntity);
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
            await expect(service.create(mockTask, '1')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('update', () => {
        it('should update a task', async () => {
            const updateTask = {
                title: 'Updated Task',
                status: task_constants_1.TaskStatus.IN_PROGRESS,
                priority: task_constants_1.TaskPriority.HIGH,
            };
            taskRepo.findOne.mockResolvedValue(Object.assign(Object.assign({}, mockTaskEntity), { user: mockUser }));
            taskRepo.save.mockResolvedValue(Object.assign(Object.assign({}, mockTaskEntity), updateTask));
            const result = await service.update('1', updateTask, mockUser);
            expect(result).toEqual(Object.assign(Object.assign({}, mockTaskEntity), updateTask));
        });
        it('should throw NotFoundException if task not found', async () => {
            taskRepo.findOne.mockResolvedValue(null);
            jest.spyOn(service, 'findById').mockResolvedValue(null);
            await expect(service.update('1', updateTask, mockUser)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('remove', () => {
        it('should soft delete a task', async () => {
            taskRepo.findOne.mockResolvedValue(Object.assign(Object.assign({}, mockTaskEntity), { user: mockUser }));
            taskRepo.softDelete.mockResolvedValue({ affected: 1 });
            await service.remove('1', mockUser);
            expect(taskRepo.softDelete).toHaveBeenCalledWith('1');
        });
        it('should throw NotFoundException if task not found', async () => {
            taskRepo.findOne.mockResolvedValue(null);
            jest.spyOn(service, 'findById').mockResolvedValue(null);
            await expect(service.remove('1', mockUser)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('findAll', () => {
        it('should return paginated tasks', async () => {
            taskRepo.findAndCount.mockResolvedValue([
                [
                    {
                        id: '1',
                        title: 'Test Task',
                        description: 'Test task description',
                        status: task_constants_1.TaskStatus.PENDING,
                        priority: task_constants_1.TaskPriority.MEDIUM,
                        due_date: new Date(),
                        created_at: new Date(),
                        updated_at: new Date(),
                        deleted_at: null,
                        user: mockUser
                    }
                ],
                1
            ]);
            userRepo.findOne.mockResolvedValue(mockUser);
            const result = await service.findAll();
            expect(result).toEqual({
                data: [
                    {
                        id: '1',
                        title: 'Test Task',
                        description: 'Test task description',
                        status: task_constants_1.TaskStatus.PENDING,
                        priority: task_constants_1.TaskPriority.MEDIUM,
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
//# sourceMappingURL=tasks.service.spec.js.map