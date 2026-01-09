import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Impersonate User DTO
 */
export class ImpersonateUserDto {
  @ApiProperty({
    description: 'Target user ID to impersonate',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
