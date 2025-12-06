import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../domain/sales/entities/sale.entity';

/**
 * Sale Item Response DTO
 */
export class SaleItemResponseDto {
  @ApiProperty({ description: 'Sale item ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Product ID', example: 'uuid' })
  productId: string;

  @ApiProperty({ description: 'Product name', example: 'Milk' })
  productName?: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 15.00 })
  unitPrice: number;

  @ApiProperty({ description: 'Discount amount', example: 0 })
  discountAmount: number;

  @ApiProperty({ description: 'Line total', example: 30.00 })
  lineTotal: number;
}

/**
 * Sale Response DTO
 */
export class SaleResponseDto {
  @ApiProperty({ description: 'Sale ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Tenant ID', example: 'uuid' })
  tenantId: string;

  @ApiProperty({ description: 'Sale number', example: 'SALE-001' })
  saleNumber: string;

  @ApiProperty({ description: 'Total amount', example: 113.50 })
  totalAmount: number;

  @ApiProperty({ description: 'Discount amount', example: 0 })
  discountAmount: number;

  @ApiProperty({ description: 'Final amount', example: 113.50 })
  finalAmount: number;

  @ApiProperty({
    description: 'Payment method',
    example: 'CASH',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Cashier ID', example: 'uuid' })
  cashierId: string;

  @ApiProperty({ description: 'Cashier name', example: 'John Doe' })
  cashierName?: string;

  @ApiProperty({ description: 'Sale items', type: [SaleItemResponseDto] })
  items: SaleItemResponseDto[];

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;
}

