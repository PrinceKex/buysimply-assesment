import { TaskStatus, TaskPriority } from './create-task.dto';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: Date;
    is_active?: boolean;
}
