import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskDto } from '../../common/types/task.type';
import { TaskStatus, TaskPriority } from '../../common/constants/task.constants';

/**
 * Entity representing a task in the system
 * Used for task management and tracking
 */
@Entity('tasks')
export class Task {
  /**
   * Unique identifier for the task
   * @type {string}
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Task title
   * @type {string}
   */
  @Column()
  title: string;

  /**
   * Task description
   * @type {string}
   */
  @Column({ nullable: true })
  description: string;

  /**
   * Task status
   * @type {TaskStatus}
   */
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  /**
   * Task priority
   * @type {TaskPriority}
   */
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.LOW,
  })
  priority: TaskPriority;

  /**
   * Due date for the task
   * @type {Date}
   */
  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  /**
   * Timestamp when the task was created
   * @type {Date}
   */
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  /**
   * Timestamp when the task was last updated
   * @type {Date}
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  /**
   * Timestamp when the task was deleted (soft delete)
   * @type {Date}
   */
  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  /**
   * User who created the task
   * @type {User}
   */
  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Converts Task entity to TaskDto
   * @returns TaskDto instance
   */
  toDto(): TaskDto {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      due_date: this.due_date,
      created_at: this.created_at,
      updated_at: this.updated_at,
      user_id: this.user.id,
      user: this.user ? this.user.toDto() : null,
    } as TaskDto;
  }
}
