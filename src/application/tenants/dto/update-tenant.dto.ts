import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Update Tenant DTO
 */
export class UpdateTenantDto {
  @ApiPropertyOptional({
    description: 'Tenant (Market) name',
    example: 'My Local Market',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Tenant name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Tenant name must be less than 255 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Tenant address',
    example: '123 Main Street, City',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Address must be less than 500 characters' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Tenant phone number',
    example: '+90 555 123 4567',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Phone must be less than 50 characters' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Tenant email',
    example: 'info@mymarket.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Tenant active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

