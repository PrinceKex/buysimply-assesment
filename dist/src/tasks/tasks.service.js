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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const user_entity_1 = require("../users/entities/user.entity");
let TasksService = class TasksService {
    constructor(tasksRepository, usersRepository) {
        this.tasksRepository = tasksRepository;
        this.usersRepository = usersRepository;
    }
    async create(createTaskDto, userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['tasks'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const task = this.tasksRepository.create(Object.assign(Object.assign({}, createTaskDto), { user }));
        return this.tasksRepository.save(task);
    }
    async findAll() {
        const [tasks, total] = await this.tasksRepository.findAndCount({
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
        return { data: tasks, total };
    }
    async findById(id) {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    async update(id, updateTaskDto, user) {
        const task = await this.findById(id);
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        if (task.user.id !== user.id) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        Object.assign(task, updateTaskDto);
        return this.tasksRepository.save(task);
    }
    async remove(id, user) {
        const task = await this.findById(id);
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        if (task.user.id !== user.id) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        await this.tasksRepository.softDelete(id);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map