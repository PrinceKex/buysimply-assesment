import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Service for managing users
 * Handles user creation, retrieval, and updates
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @Inject('BCRYPT') private bcrypt: any,
  ) {}

  /**
   * Create a new user
   * @param createUserDto User creation data
   * @returns Created user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, role_id, ...userData } = createUserDto;
    const hashedPassword = await this.bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      ...userData,
      password_hash: hashedPassword,
      role_id,
    });

    return this.usersRepository.save(user);
  }

  /**
   * Find all users
   * @returns Users with role information
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softDelete({ id });
  }

  /**
   * Find user by ID
   * @param id User ID
   * @returns User with role information
   */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email
   * @param email User's email
   * @returns User with role information
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  /**
   * Update user information
   * @param id User ID
   * @param updateUserDto User update data
   * @returns Updated user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      user.password_hash = await this.bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * Delete user
   * @param id User ID
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.usersRepository.softDelete(id);
  }

  /**
   * Verify user password
   * @param user User to verify
   * @param password Password to check
   * @returns true if password matches
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return this.bcrypt.compare(password, user.password_hash);
  }

  private async getDefaultRole(): Promise<Role> {
    return this.rolesRepository.findOne({
      where: { name: 'USER' },
    });
  }
}
