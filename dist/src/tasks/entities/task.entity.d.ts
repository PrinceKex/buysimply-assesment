import { User } from '../../users/entities/user.entity';
import { TaskDto } from '../../common/types/task.type';
import { TaskStatus, TaskPriority } from '../../common/constants/task.constants';
export declare class Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: Date;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    user: User;
    toDto(): TaskDto;
}
