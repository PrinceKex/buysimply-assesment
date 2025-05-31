import { RoleDto } from '@buysimply/roles/dto/role.dto';
export declare class UserDto {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role_id: string;
    role: RoleDto;
    role_code: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}
