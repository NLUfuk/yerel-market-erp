import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Assign Role DTO
 */
export class AssignRoleDto {
  @ApiProperty({
    description: 'Role ID to assign',
    example: 'uuid-role-id',
  })
  @IsUUID('4', { message: 'Role ID must be a valid UUID' })
  roleId: string;
}

