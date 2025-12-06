import { ApiProperty } from '@nestjs/swagger';

/**
 * Base Response DTO
 * Standard API response wrapper
 */
export class BaseResponseDto<T> {
  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation successful',
  })
  message?: string;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  constructor(data: T, message?: string) {
    this.data = data;
    this.message = message;
    this.success = true;
  }
}

