import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * User Response DTO
 */
export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Tenant ID (null for SuperAdmin)',
    example: 'uuid',
    nullable: true,
  })
  tenantId: string | null;

  @ApiProperty({ description: 'Is user active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'User roles', example: ['TenantAdmin', 'Cashier'] })
  roles: string[];

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}

