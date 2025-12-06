import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Update Product DTO
 */
export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Milk',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Product name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Product name must be less than 255 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Product SKU',
    example: 'MLK-01',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'SKU is required' })
  @MaxLength(100, { message: 'SKU must be less than 100 characters' })
  sku?: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '8690123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Barcode must be less than 100 characters' })
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 'uuid-category-id',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Unit price',
    example: 15.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Unit price cannot be negative' })
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Cost price',
    example: 12.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Cost price cannot be negative' })
  costPrice?: number;

  @ApiPropertyOptional({
    description: 'Stock quantity',
    example: 25,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Stock quantity cannot be negative' })
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: 'Minimum stock level',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Min stock level cannot be negative' })
  minStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Is product active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

