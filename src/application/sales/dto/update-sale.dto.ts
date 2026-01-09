import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../domain/sales/entities/sale.entity';
import { SaleItemDto } from './create-sale.dto';

/**
 * Update Sale DTO
 * Same structure as CreateSaleDto
 */
export class UpdateSaleDto {
  @ApiProperty({
    description: 'Sale items',
    type: [SaleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({
    description: 'Payment method',
    example: 'CASH',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Total discount amount',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Discount cannot be negative' })
  discountAmount?: number;
}

