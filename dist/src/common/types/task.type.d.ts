import { TaskStatus, TaskPriority } from '../constants/task.constants';
import { UserDto } from './user.type';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: Date;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: Date;
}
export declare class TaskDto {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: Date;
    created_at: Date;
    updated_at: Date;
    user_id: string;
    user: UserDto;
    deleted_at?: Date;
    constructor(partial: Partial<TaskDto>);
}
