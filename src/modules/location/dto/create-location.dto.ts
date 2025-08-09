import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ 
    description: 'City ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsUUID()
  cityId: string;
}