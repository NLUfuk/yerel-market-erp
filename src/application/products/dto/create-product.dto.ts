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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Create Product DTO
 */
export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Milk',
  })
  @IsString()
  @MinLength(2, { message: 'Product name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Product name must be less than 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Product SKU (unique per tenant)',
    example: 'MLK-01',
  })
  @IsString()
  @MinLength(1, { message: 'SKU is required' })
  @MaxLength(100, { message: 'SKU must be less than 100 characters' })
  sku: string;

  @ApiPropertyOptional({
    description: 'Product barcode',
    example: '8690123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Barcode must be less than 100 characters' })
  barcode?: string;

  @ApiProperty({
    description: 'Category ID',
    example: 'uuid-category-id',
  })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId: string;

  @ApiProperty({
    description: 'Unit price',
    example: 15.00,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Unit price cannot be negative' })
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Cost price',
    example: 12.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Cost price cannot be negative' })
  costPrice?: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 25,
    minimum: 0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Stock quantity cannot be negative' })
  stockQuantity: number = 0;

  @ApiPropertyOptional({
    description: 'Minimum stock level',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Min stock level cannot be negative' })
  minStockLevel: number = 0;

  @ApiPropertyOptional({
    description: 'Is product active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive: boolean = true;
}

