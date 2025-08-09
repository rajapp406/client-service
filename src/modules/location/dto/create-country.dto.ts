import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ 
    example: 'India', 
    description: 'Name of the country',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    example: 'IN', 
    description: 'ISO country code (2-3 characters)',
    minLength: 2,
    maxLength: 3
  })
  @IsString()
  @MinLength(2)
  @MaxLength(3)
  code: string;
}