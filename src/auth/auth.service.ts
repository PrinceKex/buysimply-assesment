import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TokenBlacklistService } from './token-blacklist.service';
import { UserDto } from '../common/types/user.type';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RateLimiterModule } from 'nestjs-rate-limiter';

/**
 * Service for authentication operations
 * Handles user authentication, token generation, and token blacklisting
 * 
 * @description This service provides methods for user authentication, 
 *              token generation, and token blacklisting.
 */
@Injectable()
export class AuthService {


  /**
   * Constructor for the AuthService
   * 
   * @param usersService Service for user operations
   * @param jwtService Service for JWT token operations
   * @param tokenBlacklistService Service for token blacklisting operations
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  /**
   * Validate user credentials
   * 
   * @param email User's email address
   * @param password User's password
   * @returns User entity if credentials are valid, null otherwise
   * 
   * @description This method validates user credentials by comparing the 
   *              provided password with the hashed password in the database.
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      // Get rate limiter key based on email
      const rateLimiterKey = `login_attempts:${email}`;
      
      // Check rate limit
      const user = await this.usersService.findByEmail(email);

      if (user && await bcrypt.compare(password, user.password_hash)) {
        return user;
      }

      // If we got here, login failed
      throw new UnauthorizedException('Invalid credentials');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate JWT token for user
   * @param user User entity
   * @returns JWT token
   */
  generateJwt(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  /**
   * Login user and return JWT token
   * @param user User entity
   * @returns Authentication response with JWT token and user data
   */
  async login(user: User): Promise<{ access_token: string; user: UserDto }> {
    // Validate credentials first
    const validUser = await this.validateUser(user.email, user.password_hash);
    if (!validUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = this.generateJwt(validUser);

    return {
      access_token,
      user: validUser.toDto(),
    };
  }

  /**
   * Get authenticated user's profile
   * @param user Authenticated user
   * @returns User DTO with profile information
   */
  async getProfile(user: User): Promise<UserDto> {
    return user.toDto();
  }

  /**
   * Invalidate user's JWT token
   * @param user Authenticated user
   */
  async logout(user: User): Promise<void> {
    const token = this.jwtService.sign({ id: user.id });
    await this.tokenBlacklistService.addToken(token);
  }
}
