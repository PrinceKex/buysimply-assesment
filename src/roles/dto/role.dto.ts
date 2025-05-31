export class RoleDto {
  id: string;
  code: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
