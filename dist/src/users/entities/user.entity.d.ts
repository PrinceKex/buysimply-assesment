import { Role } from '../../roles/entities/role.entity';
import { Task } from '../../tasks/entities/task.entity';
import { UserDto } from '../../common/types/user.type';
export declare class User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role_id: string;
    role: Role;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    tasks: Task[];
    toDto(): UserDto;
}
