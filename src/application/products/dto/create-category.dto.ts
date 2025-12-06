import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Create Category DTO
 */
export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Dairy',
  })
  @IsString()
  @MinLength(2, { message: 'Category name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Category name must be less than 255 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Milk, cheese, yogurt, etc.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must be less than 1000 characters' })
  description?: string;
}

