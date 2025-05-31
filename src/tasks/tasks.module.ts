import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';

/**
 * Module for task management
 * Provides functionality for creating, updating, and managing tasks
 */
@Module({
  /**
   * Module configuration
   */
  imports: [
    /**
     * TypeORM module for Task and User entities
     */
    TypeOrmModule.forFeature([Task, User]),
    AuthModule,
    RedisModule,
  ],
  controllers: [
    /**
     * Task controller for handling HTTP requests
     */
    TasksController,
  ],
  providers: [
    /**
     * Task service for business logic
     */
    TasksService,
  ],
  exports: [
    /**
     * Export Task service for use in other modules
     */
    TasksService,
  ],
})
export class TasksModule {}
