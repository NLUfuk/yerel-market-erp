import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Tenant Response DTO
 */
export class TenantResponseDto {
  @ApiProperty({ description: 'Tenant ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Tenant name', example: 'My Local Market' })
  name: string;

  @ApiPropertyOptional({ description: 'Tenant address', required: false })
  address?: string;

  @ApiPropertyOptional({ description: 'Tenant phone', required: false })
  phone?: string;

  @ApiPropertyOptional({ description: 'Tenant email', required: false })
  email?: string;

  @ApiProperty({ description: 'Is tenant active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}

