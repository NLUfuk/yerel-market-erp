import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Register Tenant DTO
 */
export class RegisterTenantDto {
  @ApiProperty({
    description: 'Tenant (Market) name',
    example: 'My Local Market',
  })
  @IsString()
  @MinLength(2, { message: 'Tenant name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Tenant name must be less than 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Tenant address',
    example: '123 Main Street, City',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Address must be less than 500 characters' })
  address?: string;

  @ApiProperty({
    description: 'Tenant phone number',
    example: '+90 555 123 4567',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Phone must be less than 50 characters' })
  phone?: string;

  @ApiProperty({
    description: 'Tenant email',
    example: 'info@mymarket.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  email?: string;

  @ApiProperty({
    description: 'Admin user email',
    example: 'admin@mymarket.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  adminEmail: string;

  @ApiProperty({
    description: 'Admin user password',
    example: 'SecurePassword123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  adminPassword: string;

  @ApiProperty({
    description: 'Admin user first name',
    example: 'John',
  })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(100, { message: 'First name must be less than 100 characters' })
  adminFirstName: string;

  @ApiProperty({
    description: 'Admin user last name',
    example: 'Doe',
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Last name must be less than 100 characters' })
  adminLastName: string;
}

