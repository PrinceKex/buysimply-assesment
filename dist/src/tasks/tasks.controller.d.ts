import { User } from '@buysimply/users/entities/user.entity';
import { Request } from 'express';
import { TaskDto } from '../common/types/task.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
type RequestWithUser = Request & {
    user: Express.User & User;
};
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: RequestWithUser): Promise<TaskDto>;
    findAll(): Promise<{
        data: TaskDto[];
        total: number;
    }>;
    findById(id: string): Promise<TaskDto>;
    update(id: string, updateTaskDto: UpdateTaskDto, req: Request & {
        user: User;
    }): Promise<TaskDto>;
    remove(id: string, req: Request & {
        user: User;
    }): Promise<void>;
}
export {};
