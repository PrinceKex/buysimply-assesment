import { User } from '@buysimply/users/entities/user.entity';
export type ExpressUser = User & {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role_id: string;
    is_active: boolean;
};
