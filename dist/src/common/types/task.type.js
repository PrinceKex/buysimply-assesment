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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskDto = exports.UpdateTaskDto = exports.CreateTaskDto = void 0;
const task_constants_1 = require("../constants/task.constants");
const user_type_1 = require("./user.type");
const swagger_1 = require("@nestjs/swagger");
class CreateTaskDto {
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task title',
        example: 'Complete project documentation',
    }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task description (optional)',
        example: 'Finish documenting all API endpoints and update README.md',
        required: false,
    }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task status',
        enum: task_constants_1.TaskStatus,
        default: task_constants_1.TaskStatus.PENDING,
    }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task priority',
        enum: task_constants_1.TaskPriority,
        default: task_constants_1.TaskPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task due date (optional)',
        example: '2025-05-30T14:30:00Z',
        required: false,
    }),
    __metadata("design:type", Date)
], CreateTaskDto.prototype, "due_date", void 0);
class UpdateTaskDto {
}
exports.UpdateTaskDto = UpdateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task title',
        example: 'Complete project documentation',
        required: false,
    }),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task description',
        example: 'Finish documenting all API endpoints and update README.md',
        required: false,
    }),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task status',
        enum: task_constants_1.TaskStatus,
        required: false,
    }),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task priority',
        enum: task_constants_1.TaskPriority,
        required: false,
    }),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task due date',
        example: '2025-05-30T14:30:00Z',
        required: false,
    }),
    __metadata("design:type", Date)
], UpdateTaskDto.prototype, "due_date", void 0);
class TaskDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.TaskDto = TaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TaskDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task title',
        example: 'Complete project documentation',
    }),
    __metadata("design:type", String)
], TaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task description (optional)',
        example: 'Finish documenting all API endpoints and update README.md',
        required: false,
    }),
    __metadata("design:type", String)
], TaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task status',
        enum: task_constants_1.TaskStatus,
        default: task_constants_1.TaskStatus.PENDING,
    }),
    __metadata("design:type", String)
], TaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task priority',
        enum: task_constants_1.TaskPriority,
        default: task_constants_1.TaskPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], TaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task due date (optional)',
        example: '2025-05-30T14:30:00Z',
        required: false,
    }),
    __metadata("design:type", Date)
], TaskDto.prototype, "due_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date and time when the task was created',
        example: '2025-05-30T14:30:00Z',
    }),
    __metadata("design:type", Date)
], TaskDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date and time when the task was last updated',
        example: '2025-05-30T14:30:00Z',
    }),
    __metadata("design:type", Date)
], TaskDto.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who owns this task',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TaskDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User who owns this task',
        type: user_type_1.UserDto,
    }),
    __metadata("design:type", user_type_1.UserDto)
], TaskDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the task was deleted (soft delete)',
        example: '2025-05-30T14:30:00Z',
        required: false,
    }),
    __metadata("design:type", Date)
], TaskDto.prototype, "deleted_at", void 0);
//# sourceMappingURL=task.type.js.map