import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Role entity representing user roles
 * Defines different roles and their relationships with users
 */
@Entity('roles')
export class Role {
  /**
   * Unique identifier for the role
   * @type {string}
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Role name (unique)
   * @type {string}
   */
  @Column({ unique: true })
  name: string;

  /**
   * Role code (unique)
   * @type {string}
   */
  @Column({ unique: true })
  code: string;

  /**
   * Role description
   * @type {string}
   */
  @Column()
  description: string;

  /**
   * Users associated with this role
   * @type {User[]}
   */
  @OneToMany(() => User, (user) => user.role)
  users: User[];

  /**
   * Timestamp when the role was created
   * @type {Date}
   */
  @CreateDateColumn()
  created_at: Date;

  /**
   * Timestamp when the role was last updated
   * @type {Date}
   */
  @UpdateDateColumn()
  updated_at: Date;

  /**
   * Default role code
   * @type {string}
   */
  static defaultRole = 'user';
}
