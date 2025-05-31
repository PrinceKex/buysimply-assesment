import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private tasksRepository;
    private usersRepository;
    constructor(tasksRepository: Repository<Task>, usersRepository: Repository<User>);
    create(createTaskDto: CreateTaskDto, userId: string): Promise<Task>;
    findAll(): Promise<{
        data: Task[];
        total: number;
    }>;
    findById(id: string): Promise<Task>;
    update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task>;
    remove(id: string, user: User): Promise<void>;
}
