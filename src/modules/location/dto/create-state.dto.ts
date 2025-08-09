import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateStateDto {
  @ApiProperty({ 
    example: 'Maharashtra', 
    description: 'Name of the state',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    description: 'Country ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsUUID()
  countryId: string;
}