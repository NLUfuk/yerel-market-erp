import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Product Response DTO
 */
export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Product name', example: 'Milk' })
  name: string;

  @ApiProperty({ description: 'Product SKU', example: 'MLK-01' })
  sku: string;

  @ApiPropertyOptional({ description: 'Product barcode', example: '8690123456789' })
  barcode?: string;

  @ApiProperty({ description: 'Category ID', example: 'uuid' })
  categoryId: string;

  @ApiProperty({ description: 'Tenant ID', example: 'uuid' })
  tenantId: string;

  @ApiProperty({ description: 'Unit price', example: 15.00 })
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Cost price', example: 12.00 })
  costPrice?: number;

  @ApiProperty({ description: 'Stock quantity', example: 25 })
  stockQuantity: number;

  @ApiProperty({ description: 'Minimum stock level', example: 10 })
  minStockLevel: number;

  @ApiProperty({ description: 'Is product active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}

