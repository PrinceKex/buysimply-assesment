import { UserDto } from '@buysimply/common/types/user.type';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './types/auth.types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: AuthenticatedRequest): Promise<{
        access_token: string;
        user: UserDto;
    }>;
    getProfile(req: AuthenticatedRequest): Promise<UserDto>;
    logout(req: AuthenticatedRequest): Promise<void>;
}
