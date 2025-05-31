import { User } from '../../users/entities/user.entity';
export declare class Role {
    id: string;
    name: string;
    code: string;
    description: string;
    users: User[];
    created_at: Date;
    updated_at: Date;
    static defaultRole: string;
}
