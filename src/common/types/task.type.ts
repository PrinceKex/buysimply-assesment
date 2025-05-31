import { TaskStatus, TaskPriority } from '../constants/task.constants';
import { UserDto } from './user.type';
import { User } from '@buysimply/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for task creation
 */
export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Complete project documentation',
  })
  title: string;

  @ApiProperty({
    description: 'Task description (optional)',
    example: 'Finish documenting all API endpoints and update README.md',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Task due date (optional)',
    example: '2025-05-30T14:30:00Z',
    required: false,
  })
  due_date?: Date;
}

/**
 * DTO for task updates
 */
export class UpdateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Complete project documentation',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Finish documenting all API endpoints and update README.md',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    required: false,
  })
  status?: TaskStatus;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
    required: false,
  })
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Task due date',
    example: '2025-05-30T14:30:00Z',
    required: false,
  })
  due_date?: Date;
}

/**
 * DTO for task responses
 */
export class TaskDto {
  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Complete project documentation',
  })
  title: string;

  @ApiProperty({
    description: 'Task description (optional)',
    example: 'Finish documenting all API endpoints and update README.md',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Task due date (optional)',
    example: '2025-05-30T14:30:00Z',
    required: false,
  })
  due_date?: Date;

  @ApiProperty({
    description: 'Date and time when the task was created',
    example: '2025-05-30T14:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date and time when the task was last updated',
    example: '2025-05-30T14:30:00Z',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'ID of the user who owns this task',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    description: 'User who owns this task',
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: 'Timestamp when the task was deleted (soft delete)',
    example: '2025-05-30T14:30:00Z',
    required: false,
  })
  deleted_at?: Date;

  constructor(partial: Partial<TaskDto>) {
    Object.assign(this, partial);
  }
}
