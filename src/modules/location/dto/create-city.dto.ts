import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ 
    example: 'Mumbai', 
    description: 'Name of the city',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    description: 'State ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsUUID()
  stateId?: string;
}