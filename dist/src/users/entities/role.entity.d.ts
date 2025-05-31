import { User } from './user.entity';
export declare class Role {
    id: number;
    name: string;
    description: string;
    users: User[];
    created_at: Date;
    updated_at: Date;
}
