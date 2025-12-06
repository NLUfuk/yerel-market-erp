import {
  IsUUID,
  IsNumber,
  Min,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockMovementType } from '../../../domain/sales/entities/stock-movement.entity';

/**
 * Create Stock Movement DTO
 */
export class CreateStockMovementDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({
    description: 'Movement type',
    example: 'PURCHASE',
    enum: StockMovementType,
  })
  @IsEnum(StockMovementType, { message: 'Invalid movement type' })
  movementType: StockMovementType;

  @ApiProperty({
    description: 'Quantity (positive for increase, negative for decrease)',
    example: 10,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  quantity: number;

  @ApiProperty({
    description: 'Unit price',
    example: 12.00,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Unit price cannot be negative' })
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Reference ID (Sale ID or Purchase ID)',
    example: 'uuid-reference-id',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Reference ID must be a valid UUID' })
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'Stock adjustment due to inventory count',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes must be less than 1000 characters' })
  notes?: string;
}

