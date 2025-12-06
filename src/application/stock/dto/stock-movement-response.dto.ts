import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockMovementType } from '../../../domain/sales/entities/stock-movement.entity';

/**
 * Stock Movement Response DTO
 */
export class StockMovementResponseDto {
  @ApiProperty({ description: 'Stock movement ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Product ID', example: 'uuid' })
  productId: string;

  @ApiProperty({ description: 'Tenant ID', example: 'uuid' })
  tenantId: string;

  @ApiProperty({
    description: 'Movement type',
    example: 'PURCHASE',
    enum: StockMovementType,
  })
  movementType: StockMovementType;

  @ApiProperty({ description: 'Quantity', example: 10 })
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 12.00 })
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Reference ID', example: 'uuid' })
  referenceId?: string;

  @ApiPropertyOptional({ description: 'Notes', example: 'Stock adjustment' })
  notes?: string;

  @ApiProperty({ description: 'Created by user ID', example: 'uuid' })
  createdBy: string;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;
}

