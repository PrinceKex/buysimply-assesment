import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/**
 * Service for managing tasks
 * Handles all business logic related to task operations
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new task for a user
   * @param createTaskDto Data for the new task
   * @param userId The ID of the user creating the task
   * @returns The created task
   */
  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['tasks'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const task = this.tasksRepository.create({
      ...createTaskDto,
      user,
    });

    return this.tasksRepository.save(task);
  }

  /**
   * Get all tasks
   * @returns Paginated list of tasks with total count
   */
  async findAll(): Promise<{ data: Task[]; total: number }> {
    const [tasks, total] = await this.tasksRepository.findAndCount({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
    return { data: tasks, total };
  }

  /**
   * Get a specific task by ID
   * @param id The task ID to retrieve
   * @returns The requested task
   * @throws NotFoundException if task is not found
   */
  async findById(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Update an existing task
   * @param id The task ID to update
   * @param updateTaskDto Updated task data
   * @param user The user who owns the task
   * @returns The updated task
   */
  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findById(id);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.user.id !== user.id) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  /**
   * Delete a task
   * @param id The task ID to delete
   * @param user The user who owns the task
   */
  async remove(id: string, user: User): Promise<void> {
    const task = await this.findById(id);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.user.id !== user.id) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.tasksRepository.softDelete(id);
  }
}
