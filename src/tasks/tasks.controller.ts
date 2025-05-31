import { User } from '@buysimply/users/entities/user.entity';
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { TaskDto } from '../common/types/task.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

type RequestWithUser = Request & { user: Express.User & User };

/**
 * Controller for handling task-related HTTP requests
 * Provides endpoints for creating, reading, updating, and deleting tasks
 */
@ApiTags('tasks')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  /**
   * Constructor for TasksController
   * @param tasksService Service for task operations
   */
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create a new task
   * @param createTaskDto Data for the new task
   * @param req Express request object containing authenticated user
   * @returns The created task as TaskDto
   * @throws {UnauthorizedException} If user is not authenticated
   */
  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: RequestWithUser): Promise<TaskDto> {
    const task = await this.tasksService.create(createTaskDto, req.user.id);
    return task.toDto();
  }

  /**
   * Get all tasks
   * @returns Array of tasks as TaskDto
   * @throws {UnauthorizedException} If user is not authenticated
   */
  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TaskDto' }
        },
        total: {
          type: 'number'
        }
      }
    }
  })
  async findAll(): Promise<{ data: TaskDto[]; total: number }> {
    const { data, total } = await this.tasksService.findAll();
    return {
      data: data.map(task => task.toDto()),
      total
    };
  }

  /**
   * Get task by ID
   * @param id The task ID to retrieve
   * @returns Task as TaskDto
   * @throws {NotFoundException} If task is not found
   * @throws {UnauthorizedException} If user is not authenticated
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findById(@Param('id') id: string): Promise<TaskDto> {
    const task = await this.tasksService.findById(id);
    return task.toDto();
  }

  /**
   * Update task
   * @param id The task ID to update
   * @param updateTaskDto Data to update the task
   * @param req Express request object containing authenticated user
   * @returns Updated task as TaskDto
   * @throws {NotFoundException} If task is not found
   * @throws {UnauthorizedException} If user is not authenticated
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: Request & { user: User }): Promise<TaskDto> {
    const task = await this.tasksService.update(id, updateTaskDto, req.user);
    return task.toDto();
  }

  /**
   * Delete task
   * @param id The task ID to delete
   * @param req Express request object containing authenticated user
   * @throws {NotFoundException} If task is not found
   * @throws {UnauthorizedException} If user is not authenticated
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id') id: string, @Req() req: Request & { user: User }): Promise<void> {
    await this.tasksService.remove(id, req.user);
  }
}
