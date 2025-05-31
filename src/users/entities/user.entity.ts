import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Task } from '../../tasks/entities/task.entity';
import { UserDto } from '../../common/types/user.type';

/**
 * Entity representing a user in the system
 * Used for user authentication and authorization
 */
@Entity('users')
export class User {
  /**
   * Unique identifier for the user
   * @type {string}
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * User's email address (unique)
   * @type {string}
   */
  @Column({ unique: true })
  email: string;

  /**
   * User's hashed password
   * @type {string}
   */
  @Column()
  password_hash: string;

  /**
   * User's first name (optional)
   * @type {string}
   */
  @Column({ nullable: true })
  first_name: string;

  /**
   * User's last name (optional)
   * @type {string}
   */
  @Column({ nullable: true })
  last_name: string;

  /**
   * ID of the user's role
   * @type {string}
   */
  @Column()
  role_id: string;

  /**
   * User's role
   * @type {Role}
   */
  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  /**
   * Whether the user is active
   * @type {boolean}
   */
  @Column({ default: true })
  is_active: boolean;

  /**
   * Timestamp when the user was created
   * @type {Date}
   */
  @CreateDateColumn()
  created_at: Date;

  /**
   * Timestamp when the user was last updated
   * @type {Date}
   */
  @UpdateDateColumn()
  updated_at: Date;

  /**
   * Timestamp when the user was deleted (soft delete)
   * @type {Date}
   */
  @DeleteDateColumn()
  deleted_at: Date;

  /**
   * User's tasks
   * @type {Task[]}
   */
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  /**
   * Converts User entity to UserDto
   * @returns UserDto instance
   */
  toDto(): UserDto {
    const dto = new UserDto();
    dto.id = this.id;
    dto.email = this.email;
    dto.first_name = this.first_name;
    dto.last_name = this.last_name;
    dto.role_id = this.role?.id || null;
    dto.role_code = this.role?.code || null;
    dto.is_active = this.is_active;
    dto.created_at = this.created_at;
    dto.updated_at = this.updated_at;
    return dto;
  }
}
