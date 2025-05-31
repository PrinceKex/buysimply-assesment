import { UserDto } from '@buysimply/common/types/user.type';
import { Controller, Delete, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from 'nestjs-rate-limiter';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from './types/auth.types';



/**
 * Controller for authentication endpoints
 * Handles user login, profile access, and logout
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Authenticate user and return JWT token
   * @param req Request object containing user credentials
   * @returns Authentication response with JWT token and user data
   */
  @Post('login')
  @UseGuards(RateLimit({
    points: 5,
    duration: 60
  }))
  async login(@Request() req: AuthenticatedRequest): Promise<{ access_token: string; user: UserDto }> {
    return this.authService.login(req.user);
  }

  /**
   * Get authenticated user's profile
   * @param req Request object containing authenticated user
   * @returns User DTO with profile information
   * @security Bearer
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: AuthenticatedRequest): Promise<UserDto> {
    return this.authService.getProfile(req.user);
  }

  /**
   * Invalidate user's JWT token
   * @param req Request object containing authenticated user
   * @security Bearer
   */
  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: AuthenticatedRequest): Promise<void> {
    await this.authService.logout(req.user);
  }
}
