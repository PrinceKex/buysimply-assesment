export declare class UserDto {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role_id: string;
    role_code: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
    static toDto(user: any): UserDto;
}
