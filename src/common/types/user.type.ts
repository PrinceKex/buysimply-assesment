import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user responses
 * Used in GET /users and GET /users/:id endpoints
 */
export class UserDto {
  /**
   * Unique identifier for the user
   * @type {string}
   */
  @ApiProperty({ description: 'Unique identifier for the user' })
  id: string;

  /**
   * User's email address
   * @type {string}
   */
  @ApiProperty({ description: 'User email' })
  email: string;

  /**
   * User's first name
   * @type {string}
   */
  @ApiProperty({ description: 'User first name' })
  first_name: string;

  /**
   * User's last name
   * @type {string}
   */
  @ApiProperty({ description: 'User last name' })
  last_name: string;

  /**
   * User's role ID
   * @type {string}
   */
  @ApiProperty({ description: 'User role ID' })
  role_id: string;

  /**
   * User's role code
   * @type {string}
   */
  @ApiProperty({ description: 'User role code' })
  role_code: string;

  /**
   * Whether the user is active or not
   * @type {boolean}
   */
  @ApiProperty({ description: 'Whether the user is active or not' })
  is_active: boolean;

  /**
   * Date and time when the user was created
   * @type {Date}
   */
  @ApiProperty({ description: 'Date and time when the user was created' })
  created_at: Date;

  /**
   * Date and time when the user was last updated
   * @type {Date}
   */
  @ApiProperty({ description: "Timestamp when the user was last updated" })
  updated_at: Date;

  /**
   * Timestamp when the user was deleted (soft delete)
   * @type {Date | undefined}
   */
  @ApiProperty({ description: "Timestamp when the user was deleted (soft delete)", required: false })
  deleted_at?: Date;

  /**
   * Converts a User entity to UserDto
   * @param user User entity to convert
   * @returns UserDto instance
   */
  static toDto(user: any): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.first_name = user.first_name;
    dto.last_name = user.last_name;
    dto.role_code = user.role?.code || null;
    dto.is_active = user.is_active;
    dto.created_at = user.created_at;
    dto.updated_at = user.updated_at;
    dto.deleted_at = user.deleted_at;
    return dto;
  }
}
