import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { TokenBlacklistService } from './token-blacklist.service';
import { UserDto } from '../common/types/user.type';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly tokenBlacklistService;
    constructor(usersService: UsersService, jwtService: JwtService, tokenBlacklistService: TokenBlacklistService);
    validateUser(email: string, password: string): Promise<User | null>;
    generateJwt(user: User): string;
    login(user: User): Promise<{
        access_token: string;
        user: UserDto;
    }>;
    getProfile(user: User): Promise<UserDto>;
    logout(user: User): Promise<void>;
}
